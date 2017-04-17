PlayersList = new Mongo.Collection('players');

Meteor.methods({
    'createPlayer': function(playerNameVar, playerPointsVar){
        check(playerNameVar, String);
        check(playerPointsVar, Number);
        var currentUserId = Meteor.userId();
        if(currentUserId){
            PlayersList.insert({
                name: playerNameVar,
                score: playerPointsVar,
                createdBy: currentUserId
            });
        }
    },
    'removePlayer': function(selectedPlayer){
        check(selectedPlayer, String);
        var currentUserId = Meteor.userId();
        if(currentUserId){    
            if(confirm("Вы уверены?")){ PlayersList.remove({_id:selectedPlayer, createdBy: currentUserId }); }
        }
    }
});

if(Meteor.isClient){
    
    Meteor.subscribe('thePlayers');

    Template.leaderboard.helpers({
        'player': function(){
            var currentUserId = Meteor.userId();
            return PlayersList.find({ createdBy:currentUserId}, 
                                    { sort: {score: -1,name:1} });
        },
        'selectedClass': function(){
            var playerId = this._id;
            var selectedPlayer = Session.get('selectedPlayer');
            if(playerId == selectedPlayer){
                return "selected"
            }
        },
        'selectedPlayer': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            return PlayersList.findOne({ _id: selectedPlayer });
        },
    });

    Template.counter.helpers({
        'con':function(){
            return PlayersList.find().count();
        }
    });

    //обработчик события
    Template.leaderboard.events({
        'click .player': function(){
            var playerId = this._id;
            Session.set('selectedPlayer', playerId);
        },
        'click .increment': function(){
            var selectedPlayer = Session.get('selectedPlayer'); //получить уникальный идентификатор выбранного игрока
            PlayersList.update({ _id: selectedPlayer },{ $inc: { score: 5 } });
        },
        'click .decrement': function(){
            var selectedPlayer = Session.get('selectedPlayer');//получить уникальный идентификатор выбранного игрока
            PlayersList.update({ _id: selectedPlayer }, {$inc: {score: -5} });
        },
        'click .remove':function(){
            var selectedPlayer = Session.get('selectedPlayer');//получить уникальный идентификатор выбранного игрока
            //if(confirm("Вы уверены?")){ PlayersList.remove({_id:selectedPlayer}); }
            Meteor.call('removePlayer', selectedPlayer);
        },
    });

    //обработчик добавления игрока
    Template.addPlayerForm.events({
        'submit form': function(event){
            event.preventDefault();//предотвращение поведения по умолчанию, т.е.обновление страницы при отправке формы
            var playerNameVar = event.target.playerName.value;//имя нового игрока
            var playerPointsVar = parseInt(event.target.playerPoints.value);//очки нового игрока
            if (isNaN(playerPointsVar)) playerPointsVar=0;
            //console.log("Добавление игрока");
            //console.log(playerNameVar);
            //console.log(event.type);
            //var currentUserId = Meteor.userId();
            Meteor.call('createPlayer', playerNameVar, playerPointsVar);
            
            //PlayersList.insert({ name: playerNameVar,score: playerPointsVar,createdBy: currentUserId});
            
            event.target.playerName.value = '';
            event.target.playerPoints.value = 0;
        }
    });

};

if(Meteor.isServer){
    Meteor.publish('thePlayers', function(){
        var currentUserId = this.userId;
        return PlayersList.find({createdBy:currentUserId});
});
};
var a = 0;