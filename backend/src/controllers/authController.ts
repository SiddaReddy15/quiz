import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import { generateId } from "../utils/idGenerator";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_12345";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [normalizedEmail],
    });

    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    await db.execute({
      sql: "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      args: [userId, name, normalizedEmail, hashedPassword, role || "STUDENT"],
    });

    const token = jwt.sign(
      { id: userId, role: role || "STUDENT" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        name,
        email,
        role: role || "STUDENT",
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [normalizedEmail],
    });

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password as string);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    await db.execute({
      sql: "UPDATE users SET name = ? WHERE id = ?",
      args: [name, userId],
    });

    res.json({ message: "Profile updated successfully", name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.execute({
      sql: "SELECT password FROM users WHERE id = ?",
      args: [userId],
    });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password as string);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.execute({
      sql: "UPDATE users SET password = ? WHERE id = ?",
      args: [hashedNewPassword, userId],
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
