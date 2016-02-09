Tracker.autorun(function () {
  Meteor.subscribe('people-pending');
  Meteor.subscribe('user-data');
});

Session.set('user', {});

Template.profileupdate.rendered = function () {
  $('.ui .form')
  .form({
    inline: true,
    on: 'blur',
    fields: {
      name: {
        identifier  : 'name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your name.'
          },
          {
            type   : 'maxLength[40]',
            prompt : "Woah! That's a long name. Try using a shorter nickname that is under 41 characters."
          }
        ]
      },
      uni: {
        identifier  : 'uni',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your UNI.'
          },
          {
            type   : 'maxLength[7]',
            prompt : 'Valid UNIs are at most 7 characters.'
          }
        ]
      },
      school: {
        identifier  : 'school',
        rules: [
          {
            type   : 'checked',
            prompt : 'Please select a school'
          }
        ]
      },
      major: {
        identifier  : 'major',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your major.'
          },
          {
            type   : 'maxLength[40]',
            prompt : "Wow, you must be smart! That's a lot of words to describe what you study. Try summing it up in under 41 characters."
          }
        ]
      },
      about: {
        identifier  : 'about',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please tell us something about yourself.'
          },
          {
            type   : 'maxLength[250]',
            prompt : "We're excited that you want to share so much about yourself! Please keep it to 250 characters though."
          }
        ]
      },
      likes: {
        identifier  : 'likes',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please tell us what you like.'
          },
          {
            type   : 'maxLength[100]',
            prompt : "You like a lot of things! Any chance you can you bring it down to 100 characters?"
          }
        ]
      },
      contactfor: {
        identifier  : 'contactfor',
        rules: [
          {
            type   : 'empty',
            prompt : "Please tell us what people should definitely contact you about. You're clearly an expert in some areas or have words of wisdom to pass down. Share it!"
          },
          {
            type   : 'maxLength[150]',
            prompt : "You must be very wise to have so many things to be contacted for. Can you keep it to 150 characters?"
          }
        ]
      },
      availability: {
        identifier  : 'availability',
        rules: [
          {
            type   : 'empty',
            prompt : "Please tell us when you're generally free to chat with folks."
          },
          {
            type   : 'maxLength[100]',
            prompt : "List your availability in 100 characters or less please."
          }
        ]
      },
      twitter: {
        identifier  : 'twitter',
        optional: true,
        rules: [
          {
            type   : 'url',
            prompt : "Please enter a valid URL (with the 'https://' part). eg - https://twitter.com/columbia"
          }
        ]
      },
      facebook: {
        identifier  : 'facebook',
        optional: true,
        rules: [
          {
            type   : 'url',
            prompt : "Please enter a valid URL (with the 'https://' part). eg - https://facebook.com/columbia"
          }
        ]
      },
      linkedin: {
        identifier  : 'linkedin',
        optional: true,
        rules: [
          {
            type   : 'url',
            prompt : "Please enter a valid URL (with the 'https://' part). eg - https://www.linkedin.com/in/barackobama"
          }
        ]
      },
      agreement: {
        identifier  : 'agreement',
        rules: [
          {
            type   : 'checked',
            prompt : 'Please acknowledge the above note by checking the box'
          }
        ]
      }
    }
  });

  Meteor.call('searchCollectionsToPopulateProfile', Meteor.userId(), function (error, response) {
    Session.set('user', response);

    var user = response;

    // Populate radio button
    if (user) {
      $('#' + user.school).prop('checked', true);
    }

    // Initialize and populate dropdown
    if (user) {
      $('.ui.dropdown').val(user.year);
    }

    // Callback for photo url in meteor-uploads
    Meteor.startup(function () {
      Uploader.finished = function(index, fileInfo, templateContext) {
        Session.set('UploadedImageUrl', fileInfo.finalUrl);
      };
    });

  });
};

Template.profileupdate.helpers({
  'userIdData': function () {
    var user = Session.get('user');
    return {
      id: user.owner
    };
  },
  'user': function () {
    return Session.get('user');
  }
});

Template.profileupdate.events({
  'submit .profileupdate': function (event) {
    event.preventDefault();

    var name = event.target.name.value;

    var email;
    if (Meteor.user().services.google) {
      email = Meteor.user().services.google.email;
    } else {
      email = Meteor.user().emails[0].address.toLowerCase();
    }

    var uni = email.substr(0, email.indexOf('@'));
    var school = event.target.school.value;
    var year = event.target.year.value;
    var major = event.target.major.value;
    var about = event.target.about.value;
    var likes = event.target.likes.value;
    var contactfor = event.target.contactfor.value;
    var availability = event.target.availability.value;
    var twitter = event.target.twitter.value;
    var facebook = event.target.facebook.value;
    var linkedin = event.target.linkedin.value;

    var image = event.target.image.src;
    if (Session.get('UploadedImageUrl')) {
      image = Session.get('UploadedImageUrl');
    }
    Session.set('UploadedImageUrl', '');

    Meteor.call('insertPendingUser',
                Meteor.userId(),
                email,
                name,
                uni,
                school,
                year,
                major,
                about,
                likes,
                contactfor,
                availability,
                twitter,
                facebook,
                linkedin,
                image
               );

               Materialize.toast('Your profile is currently under review and will be posted once approved.', 4000);
  },
  'click #deleteprofile': function() {
    event.preventDefault();    
    Meteor.call('deleteUser', Meteor.userId());
    Materialize.toast('Your profile has been successfully deleted.', 4000);
  }
});
