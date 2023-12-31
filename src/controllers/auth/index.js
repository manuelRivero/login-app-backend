import User from "./../../models/user.js";
import { validateBody } from "./../../helpers/validate/index.js";
import bcript from "bcryptjs";
import joi from "joi";
import { generatejWT } from "../../helpers/auth/index.js";
import cloudinary from "../../helpers/imageUpload/index.js";
import mongoose from "mongoose";

export const register = {
  check: (req, res, next) => {
    const schema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      lastName: joi.string().required(),
      password: joi.string().min(8).required(),
    });
    validateBody(req, next, schema);
  },
  do: async (req, res, next) => {
    const { files, body } = req;
    const { name, lastName, password, email } = body;

    try {
      const targetUser = await User.find({ email: email });
      console.log("target user", targetUser);
      if (targetUser.length > 0) {
        res.status(400).json({
          ok: false,
          error: "Usuario ya registrado",
          ref: "email",
        });
        return;
      }
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: "Error al identificar al usuario",
        ref: "email",
      });
    }

    try {
      const salt = bcript.genSaltSync();
      const newUser = new User({
        name,
        lastName,
        email,
      });

      if (files && files.image) {
        try {
          const imageUrl = await cloudinary.uploader.upload(
            files.image.tempFilePath,
            { folder: "users" }
          );
          newUser.avatar = imageUrl.secure_url;
        } catch {}
      } else {
        newUser.avatar = null;
      }
      newUser.password = bcript.hashSync(password, salt);
      await newUser.save();
      res.json({
        ok: true,
      });
    } catch (error) {
      console.log("error", error);
      res.status(400).json({
        ok: false,
        error: "Error en la creación del usuario",
        ref: "email",
      });
    }
  },
};

export const login = {
  check: (req, res, next) => {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    });
    validateBody(req, next, schema);
  },
  do: async (req, res, next) => {
    const { email, password } = req.body;
    const targetUser = await User.findOne({ email }).select(
      "email name lastName avatar password"
    );
    if (!targetUser) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }
    if (!bcript.compareSync(password, targetUser.password)) {
      return res.status(404).json({
        ok: false,
        message: "Contraseña incorrecta",
      });
    }
    const token = await generatejWT(targetUser.id);
    res.status(200).json({
      ok: true,
      token,
      user: {
        avatar:targetUser.avatar,
        email: targetUser.email,
        lastName: targetUser.lastName,
        name: targetUser.name,
      },
    });
  },
};
