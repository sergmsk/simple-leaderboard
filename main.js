PlayersList = new Mongo.Collection('players');
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
            if(confirm("Вы уверены?")){
            PlayersList.remove({_id:selectedPlayer});
            }
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
            var currentUserId = Meteor.userId();
            PlayersList.insert({
                name: playerNameVar,
                score: playerPointsVar,
                createdBy: currentUserId
            });
            event.target.playerName.value = '';
            event.target.playerPoints.value = 0;
        }
    });

};

if(Meteor.isServer){
    Meteor.publish('thePlayers', function(){
    return PlayersList.find();
});
};
var a = 0;