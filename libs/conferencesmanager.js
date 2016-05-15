var db = require('./dbmanager'),
    q = require('q'),
    log = require('./logger')(module),
    sql = require('mssql');

function getConferences() {
    var deferred = q.defer();

    db.getConnection()
        .then(function (connection) {
            new connection.Request()
                .input('SelectedPhotoTypeId', sql.Int, 1)
                .execute('GetAllConferences')
                .then(function (res) {
                    deferred.resolve(res);
                })
        })
        .fail(function (err) {
            log.error(err);
            deferred.reject(err);
        });

    return deferred.promise;
}

function getConferenceInfo(id) {
    var deferred = q.defer();

    db.getConnection()
        .then(function (connection) {
            new connection.Request()
                .input('SelectedConferenceId', sql.Int, id)
                .execute('GetConferenceInfo')
                .then(function (res) {
                    var converted = convertRecords(res);
                    if (converted === null) {
                        console.log('here');
                        deferred.reject(new TypeError('No conference with such id found in database'));
                    }
                    else {
                        deferred.resolve(converted);
                    }
                })
        })
        .fail(function (err) {
            log.error(err);
            deferred.reject(err);
        });

    return deferred.promise;
}

function convertRecords(records) {
    var conference = {};

    if (records[0].length === 0) {
        return null;
    }

    conference.ConferenceId = records[0][0].ConferenceId;
    conference.Title = records[0][0].Title;
    conference.StatusDescription = records[0][0].StatusDescription;
    conference.Description = records[0][0].Description;
    conference.CityName = records[0][0].CityName;
    conference.Address = records[0][0].Address;
    conference.StartDate = records[0][0].StartDate;
    conference.EndDate = records[0][0].EndDate;
    conference.PhotoIDs = [];
    conference.SpeechIDs = [];
    for (var i in records[0]) {
        if (conference.PhotoIDs.indexOf(records[0][i].ConferencePhotoId) === -1) {
            conference.PhotoIDs.push(records[0][i].ConferencePhotoId);
        }

        if (conference.SpeechIDs.indexOf(records[0][i].SpeechId) === -1) {
            conference.SpeechIDs.push(records[0][i].SpeechId);
        }
    }
    return conference;
}


module.exports = {
    getConferences : getConferences,
    getConferenceInfo : getConferenceInfo
};