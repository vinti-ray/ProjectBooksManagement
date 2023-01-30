const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const { userJoi, loginJoi } = require('../validation/joiValidation')

/* ----------------Create User Api---------------- */
const createUser = async (req, res) => {
    try {
        /* -------------Validation-------------- */
        let data = req.body
        try {
            const valid = await userJoi.validateAsync(data)
        }
        catch (e) { return res.status(400).send({ msg: e.message }) }

        let checkUserExists = await userModel.findOne({ email: data.email })
        if (checkUserExists) return res.status(404).send({ status: false, msg: "User present already" })

        /* -------------Business Logic-------------- */
        let createUser = await userModel.create(data)
        return res.status(201).send({ status: true, data: createUser })

    } catch (e) {
        return res.status(500).send({ msg: e.message })
    }
}

/* ---------------Login Api---------------------- */
const login = async (req, res) => {
    try {
        /* -----------------Validation------------ */
        let data = req.body
        try {
            const valid = await loginJoi.validateAsync(data)
        }
        catch (e) { return res.status(400).send({ msg: e.message }) }

        let checkUserExists = await userModel.findOne({ $and: [{ email: data.email }, { password: data.password }] })
        if (!checkUserExists) return res.status(404).send({ status: false, msg: "Credentials do not match" })

        /* -----------------Business Logic------------ */
        let token = jwt.sign({ userId: checkUserExists._id }, "GodIsGreat", { expiresIn: "24h" })
        res.cookie("token", token, { httpOnly: true })
        return res.status(200).send({ status: true, data: token })

    } catch (e) {
        return res.status(500).send({ msg: e.message })
    }
}

module.exports = { createUser, login }