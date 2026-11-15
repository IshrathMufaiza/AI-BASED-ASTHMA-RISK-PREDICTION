const User = require("../models/User");
const HealthRecord = require("../models/HealthRecord");
const DoctorNote = require("../models/DoctorNote");
const Alert = require("../models/Alert");
const AIPrediction = require("../models/AIPrediction");

// ==========================================
// CHECK DOCTOR-PATIENT AUTHORIZATION
// ==========================================

const isAuthorizedDoctor = (doctor, patient) => {
  if (!doctor || !patient) {
    return false;
  }

  if (doctor.role !== "doctor") {
    return false;
  }

  const doctorName = doctor.name.replace(/\s/g, "").toLowerCase();
  const assignedDoctor = (patient.assignedDoctor || "")
    .replace(/\s/g, "")
    .toLowerCase();

  return doctorName === assignedDoctor;
};

// ==========================================
// GET PATIENT DETAILS
// ==========================================

const getPatientDetails = async (req, res) => {
  try {
   const patient = await User.findById(req.params.id).select("-password");

if (!patient || patient.role !== "patient") {
  return res.status(404).json({
    message: "Patient not found",
  });
}

    // ------------------------------------------
    // AUTHORIZATION CHECK
    // ------------------------------------------

    if (req.user.role === "patient") {
      // Patients can only access their own data
      if (req.user.id !== patient._id.toString()) {
        return res.status(403).json({
          message: "Access denied",
        });
      }
    } else if (req.user.role === "doctor") {
      // Doctors can only access assigned patients
      const doctor = await User.findById(req.user.id).select(
        "name role"
      );

      if (!isAuthorizedDoctor(doctor, patient)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // ------------------------------------------
    // FETCH PATIENT HEALTH DATA
    // ------------------------------------------

    const latestHealthRecord = await HealthRecord.findOne({
      patientId: req.params.id,
    }).sort({ createdAt: -1 });

    const healthHistory = await HealthRecord.find({
      patientId: req.params.id,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const doctorNotes = await DoctorNote.find({
      patientId: req.params.id,
    }).sort({ createdAt: -1 });

    const alerts = await Alert.find({
      patientId: req.params.id,
    }).sort({ createdAt: -1 });

    const aiPredictions = await AIPrediction.find({
  patientId: req.params.id,
})
  .sort({ capturedAt: -1 })
  .limit(30);

    res.status(200).json({
  patient,
  latestHealthRecord,
  healthHistory,
  doctorNotes,
  alerts,
  aiPredictions,
});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// ADD DOCTOR NOTE
// ==========================================

const addDoctorNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({
        message: "Note cannot be empty",
      });
    }

    // ------------------------------------------
    // ONLY DOCTORS CAN ADD NOTES
    // ------------------------------------------

    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Only doctors can add clinical notes",
      });
    }

   const patient = await User.findById(req.params.id);

if (!patient || patient.role !== "patient") {
  return res.status(404).json({
    message: "Patient not found",
  });
}

    // ------------------------------------------
    // VERIFY DOCTOR-PATIENT ASSIGNMENT
    // ------------------------------------------

    const doctor = await User.findById(req.user.id).select(
      "name role"
    );

    if (!isAuthorizedDoctor(doctor, patient)) {
      return res.status(403).json({
        message: "You are not authorized to add notes for this patient",
      });
    }

    // ------------------------------------------
    // CREATE NOTE
    // ------------------------------------------

    const doctorNote = await DoctorNote.create({
      patientId: patient._id,
      doctorId: req.user.id,
      note: note.trim(),
    });

    res.status(201).json(doctorNote);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getPatientDetails,
  addDoctorNote,
};