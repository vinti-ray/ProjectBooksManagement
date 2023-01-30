const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')
const { reviewJoi } = require('../validation/joiValidation')

/* --------------------Create Review------------------ */
const createReview = async (req, res) => {
    try {
        /* -----------------Validation------------ */
        let data = req.body
        let bookId = req.params.bookId
        try {
            const valid = await reviewJoi.validateAsync(data)
        }
        catch (e) { return res.status(400).send({ msg: e.message }) }

        /* -----------------Logic------------ */
        let checkBookExists = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookExists) return res.status(404).send("Book Does Not Exists")
        data.reviewedAt = Date.now()
        data.bookId = bookId

        let createReview = await reviewModel.create(data)
        console.log("reached")
        let updateBookCount = await bookModel.findByIdAndUpdate(bookId, { $inc: { reviews: 1 } }, { new: true })

        let showData = JSON.parse(JSON.stringify(updateBookCount))
        showData.reviewData = createReview
        return res.status(200).send({ status: true, data: showData })

    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
}

/* --------------------Update Review------------------ */
const updateReview = async (req, res) => {
    try {
        let data = req.body
        let { review, rating, reviewedBy } = data
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        let checkBookExists = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookExists) return res.status(404).send("Book Does Not Exists")
        let checkReviewExists = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewExists) return res.status(404).send("Review Does Not Exists")

        const updateReview = await reviewModel.findByIdAndUpdate(reviewId, { $set: { review: review, rating: rating, reviewedBy: reviewedBy } }, { new: true }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        let showData = JSON.parse(JSON.stringify(checkBookExists))
        showData.reviewData = updateReview
        return res.status(200).send({ status: true, message: "Book lists", data: showData })

    } catch (e) {
        return res.status(500).send({ error: e.message })
    }

}

/* --------------------Delete Review------------------ */
const deleteReview = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        let checkBookExists = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookExists) return res.status(404).send("Book Does Not Exists")
        let checkReviewExists = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewExists) return res.status(404).send("Review Does Not Exists")

        await reviewModel.findByIdAndUpdate(reviewId, { $set: { isDeleted: true } })
        await bookModel.findByIdAndUpdate(bookId, { $inc: { reviews: -1 } })
        return res.status(200).send({ message: "successfully deleted" })

    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
}


module.exports = { createReview, updateReview, deleteReview }