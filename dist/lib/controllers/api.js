'use strict';

var mongoose = require('mongoose'),
    http = require('http'),
    q = require("q"),
    moment = require("moment"),
    entities = {
        question: mongoose.model('question'),
        student: mongoose.model('student'),
        poll: mongoose.model('poll'),
        assessment: mongoose.model('assessment'),
        feedback: mongoose.model('feedback'),
        action: mongoose.model('action')
    };

// socket.io settings
/**
 * Get awesome things
 */
exports.get = function(req, res) {
    var type = req.params.type.toLowerCase();
    var callback = function(err, results) {
        if (!err) {
            return res.json(results);
        } else {
            return res.send(err);
        }
    };
    if(req.params.id){
        entities[type].findOne({_id: req.params.id}, callback);
    } else {
        entities[type].find(callback);
    }
};

exports.getActivePoll = function(req, res) {
    entities.poll.findOne({ end: null }, function(err, results) {
        if (!err) {
            return res.json(results);
        } else {
            return res.send(err);
        }
    });
};

exports.getActiveAssessment = function(req, res) {
    entities.assessment.findOne({ end: null }, function(err, results) {
        if (!err) {
            return res.json(results);
        } else {
            return res.send(err);
        }
    });
};

exports.getActiveFeedback = function(req, res) {
    entities.feedback.findOne({ end: null }, function(err, results) {
        if (!err) {
            return res.json(results);
        } else {
            return res.send(err);
        }
    });
};

exports.getCurrentPollResults = function(req, res) {
    entities.poll.findOne({ end: null }, function(err, poll) {
        // do logic
        // find latest actions per student
        // if action.created.add("seconds", 30) < now state = 0
        // return 
        var students = {};
        if (!poll) {
            res.send(404);
            return;
        }

        poll.actions.forEach(function(item, i){
            students[item.student.name] = item;
        });
        if (!err) {
            return res.json(students);
        } else {
            return res.send(err);
        }
    });
};
exports.getCurrentAssessmentResults = function(req, res) {
    entities.assessment.findOne({ end: null }, function(err, assessment) {
        // do logic
        // find latest actions per student
        // if action.created.add("seconds", 30) < now state = 0
        // return 
        if (!err) {
            var students = {};
            if (!assessment || !assessment.questionResults.length) {
                res.send(404);
                return;
            }
            assessment.questionResults.forEach(function(item, i){
                students[item.student.name] = item;
            });

            return res.json(students);
        } else {
            return res.send(err);
        }
    });
};
exports.getCurrentFeedbackResults = function(req, res) {
    entities.assessment.findOne({ end: null }, function(err, feedback) {
        // do logic
        // find latest actions per student
        // if action.created.add("seconds", 30) < now state = 0
        // return 
        if (!err) {
            return res.json(feedback);
        } else {
            return res.send(err);
        }
    });
};

exports.createPolls = function(req, res) {
    var deferred = q.defer();
    req.body.start = moment.utc();
    entities.poll.create(req.body, function(err, poll){
        if (!err) {
            deferred.resolve();
            return res.send(201, "/api/poll/" + poll._id);
        } else {
            deferred.reject(err);
            return res.send(err);
        }
    });
    return deferred.promise;
};

exports.updatePolls = function(req, res) {
    var deferred = q.defer();
    entities.poll.findOne({_id: req.params.id}, function(err, poll){
        if (err) { return next(err); }
        poll.end = moment.utc();
        poll.save(function(err) {
            if (!err) {
                deferred.resolve();
                return res.send(200);
            } else {
                deferred.reject(err);
                return next(err);
            }
        });
    });
    return deferred.promise;
};

exports.updateAssessment = function(req, res) {
    var deferred = q.defer();
    entities.assessment.findOne({_id: req.params.id}, function(err, assessment){
        if (err) { return next(err); }
        assessment.end = moment.utc();
        assessment.save(function(err) {
            if (!err) {
                deferred.resolve();
                return res.send(200);
            } else {
                deferred.reject(err);
                return next(err);
            }
        });
    });
    return deferred.promise;
};
exports.updateFeedback = function(req, res) {
    var deferred = q.defer();
    entities.feedback.findOne({_id: req.params.id}, function(err, feedback){
        if (err) { return next(err); }
        feedback.end = moment.utc();
        feedback.save(function(err) {
            if (!err) {
                deferred.resolve();
                return res.send(200);
            } else {
                deferred.reject(err);
                return next(err);
            }
        });
    });
    return deferred.promise;
};

exports.postPollAction = function(req, res) {
    var deferred = q.defer();
    req.body.created = moment.utc();
    entities.poll.update({
        _id: req.params.id
    },{
        $push: {
            actions : req.body
        }
    },{
        upsert: true
    }, function(err){
        if (!err) {
            deferred.resolve();
            return res.send(200);
        } else {
            deferred.reject(err);
            return res.send(err);
        }
    });
    return deferred.promise;
};
exports.postQuestionResult = function(req, res) {
    var deferred = q.defer();
    entities.assessment.update({
        _id: req.params.id
    },{
        $push: {
            questionResults : req.body
        }
    },{
        upsert: true
    }, function(err){
        if (!err) {
            deferred.resolve();
            return res.send(200);
        } else {
            deferred.reject(err);
            return res.send(err);
        }
    });
    return deferred.promise;
};

exports.postFeedbackResult = function(req, res) {
    var deferred = q.defer();
    entities.feedback.update({
        _id: req.params.id
    },{
        $push: {
            feedbackResults : req.body
        }
    },{
        upsert: true
    }, function(err){
        if (!err) {
            deferred.resolve();
            return res.send(200);
        } else {
            deferred.reject(err);
            return res.send(err);
        }
    });
    return deferred.promise;
};

exports.postStudents = function(req, res) {
    var deferred = q.defer();
    entities.student.create(req.body, function(err, student){
        if (!err) {
            deferred.resolve();
            return res.send(201, "/api/student/" + student._id);
        } else {
            deferred.reject(err);
            return res.send(err);
        }
    });
    return deferred.promise;
};
exports.postAssessment = function(req, res) {
    var deferred = q.defer();
    req.body.start = moment.utc();
    entities.assessment.create(req.body, function(err, assessment){
        if (!err) {
            deferred.resolve();
            return res.send(201, assessment);
        } else {
            deferred.reject(err);
            return res.send(err);
        }
    });
    return deferred.promise;
};
exports.postFeedback = function(req, res) {
    var deferred = q.defer();
    req.body.start = moment.utc();
    entities.feedback.create(req.body, function(err, feedback){
        if (!err) {
            deferred.resolve();
            return res.send(201, feedback);
        } else {
            deferred.reject(err);
            return res.send(err);
        }
    });
    return deferred.promise;
};