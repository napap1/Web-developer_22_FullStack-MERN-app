//////////////
// Imports //
////////////

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Security
const passport = require('passport');

// Validation
const validatePostInput = require('../../validation/post');

///////////////////
// GET requests //
/////////////////

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: "Posts works" });
});


// @route   GET api/posts/
// @desc    Get all posts
// @access  Private
router.get('/', (req, res) => {
   Post.find().sort({ date: -1 }) // descending order
       .then(posts => res.json(posts))
       .catch(err => res.status(404).json({ nopostfound: 'No posts found'}));
});


// @route   GET api/posts/:id
// @desc    Get a single post by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id) // descending order
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ nopostfound: 'No post found with that ID'}));
});


// @route   POST api/posts/
// @desc    Create a post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
        // If any errors, send 400 with errors objects
        return res.status(400).json(errors);
    }

    const newPost = new Post({
       text: req.body.text,
       name: req.body.name,
       avatar: req.body.avatar, // The avatar is coming from the State of the react component
       user: req.user.id
   });

    newPost.save().then((post) => res.json(post));
});


// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            Post.findById(req.params.id)
                .then(post => {
                    // Check for post owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' });
                    }

                    // Delete the post
                    post.remove().then(() => res.json({ deleted: 'succes' }));
                })
                .catch(err => res.json(err));
        })
});




//////////////
// Exports //
////////////

module.exports = router;
