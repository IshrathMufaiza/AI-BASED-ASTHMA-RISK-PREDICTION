const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      age,
      weight,
      height,
      emergencyContact,
      assignedDoctor,
      contactNumber,
      doctorRegistrationKey,
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password || !role) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (role !== "patient" && role !== "doctor") {
      return res.status(400).json({
        message: "Invalid registration role",
      });
    }

    // Doctor registration requires a private registration key.
    if (role === "doctor") {
      if (
        !process.env.DOCTOR_REGISTRATION_KEY ||
        doctorRegistrationKey !== process.env.DOCTOR_REGISTRATION_KEY
      ) {
        return res.status(403).json({
          message: "Invalid doctor registration key",
        });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      age: role === "patient" ? age : undefined,
      weight: role === "patient" ? weight : undefined,
      height: role === "patient" ? height : undefined,

      emergencyContact:
        role === "patient" ? emergencyContact : undefined,

      assignedDoctor:
        role === "patient" ? assignedDoctor?.trim() : undefined,

      contactNumber:
        role === "doctor" ? contactNumber?.trim() : undefined,

      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let doctorContact = null;
    let doctorName = null;

    // Find assigned doctor's contact for patients
    if (user.role === "patient" && user.assignedDoctor) {
      const normalizedDoctorName = user.assignedDoctor
        .replace(/\s/g, "")
        .toLowerCase();

      const doctors = await User.find({
        role: "doctor",
      }).select("name contactNumber");

      const assignedDoctor = doctors.find(
        (doctor) =>
          doctor.name.replace(/\s/g, "").toLowerCase() ===
          normalizedDoctorName
      );

      if (assignedDoctor) {
        doctorName = assignedDoctor.name;
        doctorContact = assignedDoctor.contactNumber || null;
      }
    }

    res.status(200).json({
      ...user.toObject(),
      doctorName,
      doctorContact,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};