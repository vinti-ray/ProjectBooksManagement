const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')
const { bookJoi, updateJoi } = require('../validation/joiValidation')
const { uploadFile } = require('../controller/aws')

/*--------------------- Create Book APi--------------------- */
const createBook = async (req, res) => {
    try {
        /* ----------------Validation---------------- */
        let fetchJSON = req.body.data // pass JSON key-value and fetch through req.body  in form-data
        let data = (JSON.parse(fetchJSON)) //Parse it
        try {
            const valid = await bookJoi.validateAsync(data)
        }
        catch (e) { return res.status(400).send({ msg: e.message }) }

        let checkUserId = await userModel.findOne({ _id: data.userId })
        if (!checkUserId) return res.status(404).send({ status: false, msg: "User not found" })
        data.releasedAt = Date.now()

        /* ----------------Business Logic------------- */
        let temp
        let files = req.files // Get the file to upload
        if (files && files.length > 0) {
            let uploadFileUrl = await uploadFile(files[0])
            temp = uploadFileUrl
        }
        else {
            return res.status(400).send({ message: "No File Found" })
        }
        data.bookCover = temp
        let createBook = await bookModel.create(data)
        return res.status(201).send({ status: true, data: createBook })


    } catch (e) {
        return res.status(500).send({ status: false, msg: e.message })
    }
}

/*--------------------- Get Book APi--------------------- */
const getBook = async (req, res) => {
    try {
        let query = req.query
        if (!query) {
            const getBook = await bookModel.find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1, }).sort({ title: 1 });
            return res.status(200).send({ status: true, data: getBook })
        }
        else {
            const getBookByQuery = await bookModel.find(query, { isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1, }).sort({ title: 1 });
            return res.status(200).send({ status: true, data: getBookByQuery })
        }

    } catch (e) {
        return res.status(500).send({ status: false, msg: e.message })
    }
}

/*--------------------- Get Book By Id APi--------------------- */
const getBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId
        if (!bookId) return res.status(400).send("BookID is required")

        let getBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        let getBookReview = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0 })
        if (!getBook) return res.status(404).send("Book not found")

        let showBook = JSON.parse(JSON.stringify(getBook))
        showBook.reviewData = getBookReview //Adding new key to object 

        return res.status(200).send({ status: true, data: showBook })

    } catch (e) {
        return res.status(500).send({ status: false, msg: e.message })
    }
}

/*----------------------Update Book By Id-------------------- */
const updateBookById = async (req, res) => {
    try {
        /* ------------------Validation-------------- */
        let data = req.body
        let bookId = req.params.bookId
        let { title, ISBN, excerpt, releasedAt } = data
        if (!bookId) return res.status(400).send("BookID is required")
        try {
            const valid = await updateJoi.validateAsync(data)
        }
        catch (e) { return res.status(400).send({ msg: e.message }) }

        /* Check if unique constrains are violated */
        let checkBookExists = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookExists) return res.status(404).send({ status: false, msg: "Book Does not exists" })
        if (title || ISBN) {
            if ((checkBookExists.title == data.title) || (checkBookExists.ISBN == data.ISBN)) {
                return res.status(400).send("Title or ISBN is already present")
            }
        }

        /* ----------------Update the book--------------- */
        let updateBook = await bookModel.findByIdAndUpdate(bookId, { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } }, { new: true })
        return res.status(200).send({ status: true, data: updateBook });

    } catch (e) {
        return res.status(500).send({ status: false, msg: e.message })
    }
}

/*----------------------Delete Book By Id-------------------- */
const deleteBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let checkBookExists = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookExists) return res.status(404).send({ status: false, msg: "Book Does not exists" })

        let deleteBook = await bookModel.findByIdAndUpdate(bookId, { $set: { isDeleted: true } }, { new: true })
        return res.status(200).send({ status: true, msg: "Deleted Successfully" })
    } catch (e) {
        return res.status(500).send({ status: false, msg: e.message })
    }
}

module.exports = { createBook, getBook, getBookById, updateBookById, deleteBookById }