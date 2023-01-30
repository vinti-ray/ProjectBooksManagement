const express = require('express')
const router = express.Router()
const { createUser, login } = require('../controller/userController')
const { createBook, getBook, getBookById, updateBookById, deleteBookById } = require('../controller/bookController')
const { createReview, updateReview, deleteReview } = require('../controller/reviewController')
const { authCreation, authUpdateDelete, authenticate } = require('../middleware/middlewares')

/* User Routes */
router.post('/register', createUser)
router.post('/login', login)

/* Book Routes */
router.post('/books', authenticate, authCreation, createBook)
router.get('/books', authenticate, getBook)
router.get('/books/:bookId', authenticate, getBookById)
router.patch('/books/:bookId', authenticate, authUpdateDelete, updateBookById)
router.delete('/books/:bookId', authenticate, authUpdateDelete, deleteBookById)

/* Review Routes */
router.post('/books/:bookId/review', createReview)
router.patch('/books/:bookId/review/:reviewId', updateReview)
router.delete('/books/:bookId/review/:reviewId', deleteReview)

/* God's Route */
router.all("/*", (req, res) => { res.status(400).send({ message: "invalid path" }); });

module.exports = router