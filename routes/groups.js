const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Group = require('../models/group');
const User = require('../models/user');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anonymoose1997123@gmail.com',
    pass: 'knucklesdragging'
  }
});


// Create group, requires the user email as a string
// requires name of the group
router.post('/create', (req, res, next) => {

  owner_user = req.body.owner_user
  console.log(req.body.group_name)

  let newGroup = new Group({
    name: req.body.group_name,
    list_of_invitees: [],
    list_of_users: [owner_user],
    state: 0,
    total_responses: 0

  })

  Group.publishGroup(newGroup, (err, group) => {
    if (err) {
      console.log(err)
      return res.json({
        success: false,
        msg: "An error occured"
      })
    } else {

      User.getUserByEmail(owner_user, (err, user) => {
        if (err) {
          return res.json({
            success: false,
            msg: "An error occured",
          })
        } else {
          user.group.push(group._id)
          user.save((err, user) => {
            return res.json({
              success: true,
              msg: "Group ID added to the user group array",
              group: group
            })
          })
        }

        // return res.json({
        //     success: true,
        //     msg: "Listing published successfully",
        //     group: group
        // })
      })
    }

  })

});


// Add members
// Send invitees as a list of strings of emails of users with accounts called invitees
// also send the group ID as a string called group_id
router.post('/addMembers', (req, res, next) => {
  const invitees = req.body.list_of_invitees;
  const group_id = req.body.group_id;
  invitee_users = []

  for (var user of invitees) {
    User.getUserByEmail(user, (err, user_object) => {
      user_object.group.push(group_id)
      console.log(user_object)
      user_object.save((err, user) => {


        var mailOptions = {
          from: 'anonymoose1997123@gmail.com',
          to: 'zain.kabani97@gmail.com',
          subject: "You've been invited to hangout with your friends on Unanimoose!",
          text: 'unanimoose.com'
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info);
            return res.json({
              success: true,
              msg: "Group ID added to the user group array, and email has been sent",
            })
          }
        });


      })




    })
  }

  // Group.getGroupById(group_id, (err, group) => {
  //   group
  // })

  // //console.log(req.body.username + " " + password)
  // User.getUserByUsername(username, (err, user) => {
  //   if (err) throw err;
  //   if (!user) {
  //     return res.json({
  //       success: false,
  //       msg: 'User not found'
  //     });
  //   }
  //
  //   User.comparePassword(password, user.password, (err, isMatch) => {
  //     if (err) throw err;
  //     if (isMatch) {
  //       const token = jwt.sign({
  //         data: user
  //       }, config.secret, {
  //         expiresIn: 604800
  //       });
  //
  //       res.json({
  //         success: true,
  //         token: 'JWT ' + token,
  //         user: {
  //           id: user._id,
  //           name: user.name,
  //           username: user.username,
  //           email: user.email,
  //           client_type: user.client_type
  //         }
  //       });
  //     } else {
  //       return res.json({
  //         success: false,
  //         msg: 'Wrong password'
  //       });
  //     }
  //   });
  // });
});

// Profile
// router.get('/', passport.authenticate('jwt', {
//   session: false
// }), (req, res, next) => {
//
//   res.json({
//     user: req.user
//   });
// });



// Needs user and a list of 0s and 1s
router.post('/upadteAvailability', (req, res, next) => {

    var counter = 0

    group_id = req.body.group_id
    availabilities = []

    available = req.body.availabilityArray.split("").slice(1,-1)

    console.log(available)

    for (var odd_thing of available) {
      if (counter%2 === 0) {
        availabilities.push(Number(odd_thing))
      }

      counter++
    }

    console.log(availabilities)


    Group.getGroupById(group_id, (err, group) => {
      group.availabilities.push(availabilities)
      if (group.list_of_invitees.length === 0 && group.list_of_users.length == group.availabilities.length) {
        send_out_emails(group)
      }
      // group.save((err, data) => {
      //   return res.json({
      //     success: true,
      //     msg: 'it worked',
      //     group: group
      //   })
      // })
    })



})

function send_out_emails(group) {

  console.log(group.list_of_users)

  for (var emailee of group.list_of_users) {
    console.log(emailee)
    var mailOptions = {
      from: 'anonymoose1997123@gmail.com',
      to: emailee,
      subject: "You've been invited to hangout with your friends on Unanimoose!",
      text: 'unanimoose.com'
    };
  }



  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info);
      return res.json({
        success: true,
        msg: "Group ID added to the user group array, and email has been sent",
      })
    }
  });

}

// router.get('/testerthingy', (req, res, next) => {
//
//   var form = new formidable.IncomingForm();
//   form.parse(req, function(err, field, file) {
//
//     console.log(field)
//
//   })
//
// })



module.exports = router;
