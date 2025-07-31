const catchAsync = require("../util/catchAsync");
const Appointment = require("../models/appointmentModel");
const AppError = require("../util/appError");
const User = require("../models/userModel");
const { getIO } = require("../socket");

exports.createAppointment = catchAsync(async (req, res, next) => {
  const { doctor, date, slotStart, slotEnd } = req.body;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointment = await Appointment.findOne({
    doctor,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    slotStart,
    slotEnd,
    status: { $ne: "cancelled" },
  });

  if (existingAppointment) {
    return next(
      new AppError(
        "This time slot is already booked. Please select another time.",
        400
      )
    );
  }

  const appointment = await Appointment.create(req.body);
  if (!appointment) {
    return next(new AppError("Failed to create appointment", 400));
  }

 
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("patient", "name email phone")
    .populate("doctor", "name email phone");


  try {
    const io = getIO();
   
    io.to(`user_${appointment.doctor._id}`).emit(
      "newAppointment",
      populatedAppointment
    );
    io.to(`user_${appointment.patient._id}`).emit(
      "newAppointment",
      populatedAppointment
    );
  } catch (error) {
    console.error("Socket emission failed:", error);
  
  }

  res.status(201).json({
    status: "success",
    appointment: populatedAppointment,
  });
});

exports.getAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.appointmentID)
    .populate("patient")
    .populate("doctor");
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }
  res.status(200).json({
    status: "success",
    appointment,
  });
});

exports.getAllAppointments = catchAsync(async (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return next(
      new AppError("You must be logged in to view appointments", 401)
    );
  }

  let query;

  if (req.user.role === "doctor") {
    query = { doctor: req.user._id };
  } else {
    query = { patient: req.user._id };
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "name email phone")
    .populate("doctor", "name email phone")
    .sort({ date: 1, slotStart: 1 }); // Sort by date and time

  res.status(200).json({
    status: "success",
    appointments,
  });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  console.log("req.body", req.body);

  // Check if user is authenticated
  if (!req.user) {
    return next(
      new AppError("You must be logged in to update appointments", 401)
    );
  }

  const appointment = await Appointment.findById(req.params.appointmentID);
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only doctors can update appointment status
  // if (req.user.role !== "doctor") {
  //   return next(
  //     new AppError("Only doctors can update appointment status", 403)
  //   );
  // }

  // Only the doctor who owns the appointment can update it
  // if (appointment.doctor.toString() !== req.user._id.toString()) {
  //   return next(new AppError("You can only update your own appointments", 403));
  // }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.appointmentID,
    req.body,
    { new: true }
  )
    .populate("patient", "name email phone")
    .populate("doctor", "name email phone");

  // Emit socket event for appointment update
  try {
    const io = getIO();
    // Emit to both doctor and patient user rooms
    io.to(`user_${updatedAppointment.patient._id}`).emit(
      "appointmentUpdated",
      updatedAppointment
    );
    io.to(`user_${updatedAppointment.doctor._id}`).emit(
      "appointmentUpdated",
      updatedAppointment
    );
  } catch (error) {
    console.error("Socket emission failed:", error);
  }

  res.status(200).json({
    status: "success",
    appointment: updatedAppointment,
  });
});

exports.getAvailableSlots = catchAsync(async (req, res, next) => {
  const { doctorID, date } = req.params;

  // Get doctor details
  const doctor = await User.findById(doctorID);
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  // Get all appointments for this doctor on the specified date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await Appointment.find({
    doctor: doctorID,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $ne: "cancelled" },
  });

  const slots = [];
  if (doctor.startTime && doctor.endTime && doctor.duration) {
    const start = new Date(date);
    const end = new Date(date);

    const docStart = new Date(doctor.startTime);
    const docEnd = new Date(doctor.endTime);

    start.setHours(docStart.getHours(), docStart.getMinutes(), 0, 0);
    end.setHours(docEnd.getHours(), docEnd.getMinutes(), 0, 0);

    let current = new Date(start);
    while (current < end) {
      const slotStart = new Date(current);
      current.setMinutes(current.getMinutes() + doctor.duration);

      if (current <= end) {
        const slotEnd = new Date(current);
        const slotStartStr = slotStart.toTimeString().slice(0, 5);
        const slotEndStr = slotEnd.toTimeString().slice(0, 5);

        const isBooked = existingAppointments.some(
          (appointment) =>
            appointment.slotStart === slotStartStr &&
            appointment.slotEnd === slotEndStr
        );

        if (!isBooked) {
          slots.push({
            start: slotStartStr,
            end: slotEndStr,
            startTime: slotStart,
            endTime: slotEnd,
          });
        }
      }
    }
  }

  res.status(200).json({
    status: "success",
    slots,
    totalSlots: slots.length,
  });
});
