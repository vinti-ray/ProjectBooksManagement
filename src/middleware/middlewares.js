const jwt = require('jsonwebtoken');
const bookModel = require('../models/bookModel');

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) return res.status(401).send({ message: "token not present" });

        jwt.verify(token, "GodIsGreat", (err, decode) => {
            if (err) {
                return res.status(401).send({ status: false, err: err.message,msg:"verify token issue" })
            } else {
                res.cookie('decode', decode, { httpOnly: true })
                next()
            }
        })

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

const authCreation = async (req, res, next) => {
    try {
        const token = req.cookies.decode
        if (!req.body.userId) return res.status(400).send({ message: "user id is not present" })

        if (!token) return res.status(401).send({ message: "Token Cookie not present" });

        if (token.userId != req.body.userId) {
            return res.status(403).send({ status: false, msg: "Not Authorized" })
        }
        next()
    }
    catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

const authUpdateDelete = async (req, res, next) => {
    try {
        const token = req.cookies.decode
        if (!token) return res.status(401).send({ message: "Token Cookie not present" });

        let bookId = req.params.bookId
        let getUserId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!getUserId) return res.status(404).send({ status: false, message: "no book found with this id " });

        if (token.userId != getUserId.userId) {
            return res.status(403).send({ status: false, msg: "Not Authorized" })
        }
        next()

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
module.exports = { authenticate, authCreation, authUpdateDelete }