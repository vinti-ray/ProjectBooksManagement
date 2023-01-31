try {
    let data = req.body
    let reviewId = req.params.reviewId
    let bookId = req.params.bookId

    let checkBook = await bookModel.findOne({ isDeleted: false, _id: bookId })
    let updateReview = await reviewModel.findByIdAndUpdate(reviewId, { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewedBy } },
        { new: true }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, _id: 0 })

    /// Adding a new key to book
    let showData = JSON.parse(JSON.stringify(checkBook))
    showData.reviewsData = updateReview
    return res.status(200).send({data:showData})

} catch (error) {
    return res.status(500).send({ e: error.message })
}