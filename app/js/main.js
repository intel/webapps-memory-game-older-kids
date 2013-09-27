/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

Card = function() {
    this.cardId = "";
    this.cardFrontId = "";
    this.cardGraphics = "";
    this.cardType = -1;
    this.found = false;
}

Game = {};

var normalCardImages = [
    "images/noglow_balloon.png",
    "images/noglow_butterflies.png",
    "images/noglow_crown.png",
    "images/noglow_cup.png",
    "images/noglow_elephant.png",
    "images/noglow_guitar.png",
    "images/noglow_horn.png",
    "images/noglow_lion.png",
    "images/noglow_moon.png",
    "images/noglow_sun.png",
    "images/noglow_zebra.png",
    "images/noglow_blank.png"
];
var glowingCardImages = [
    "images/card_flip_balloon.png",
    "images/card_flip_butterflies.png",
    "images/card_flip_crown.png",
    "images/card_flip_cup.png",
    "images/card_flip_elephant.png",
    "images/card_flip_guitar.png",
    "images/card_flip_horn.png",
    "images/card_flip_lion.png",
    "images/card_flip_moon.png",
    "images/card_flip_sun.png",
    "images/card_flip_zebra.png",
    "images/card_flip_blank.png"
];

var stariconsList = [
    "images/purple_star.png",
    "images/green_star.png",
    "images/red_star.png"
];

var audioItems = [
    "flipcard_sound1",
    "flipcard_sound2",
    "startGame_sound",
    "finaleIntro_sound",
    "winLevel_sound",
    "victory_sound"
];

var audioSrc = [
    "audio/FlipCard.wav",
    "audio/FlipCard.wav",
    "audio/StartPage.wav",
    "audio/TheFinale.wav",
    "audio/WinLevel.wav",
    "audio/YouWin.wav"
];

var SOUND_FLIPCARD1 = 0;
var SOUND_FLIPCARD2 = 1;
var SOUND_STARTGAME = 2;
var SOUND_FINALEINTRO = 3;
var SOUND_LEVEL_WON = 4;
var SOUND_VICTORY = 5;


var LOCKED_LEVELCARD_STYLE = "setLevel_lockedLevel";
var SHOWCARD_STYLE = "flip_to_visible";
var GAMES_PER_LEVEL = 3;
var LOCAL_STORAGE_KEY = "memorygame_locked_levels";


(function () {
    var cardsArray = new Array();
    var levelSelectionUserChoice = -1;
    var ignoreInputs = false;
    var firstFlippedCard = undefined;
    var clickedCardElement = undefined;
    var levelNumber = -1;
    var passedGames = 0;
    var lastPlayedFlipSound = SOUND_FLIPCARD2;
    var levelLockingStatus = [ false, true, true, true ];
    
    // Set memberfunctions.
    Game.flipCallback = flipCallback;
    Game.flipDelayCallback = flipDelayCallback;
    Game.gotoNextGame = gotoNextGame;
    Game.levelSelectionAnimCallback = levelSelectionAnimCallback;
    Game.introViewSkipCallback = introViewSkipCallback;
    
    /**
     * Create sound element base on their ID
     */
    function createSoundElement(soundId) {
        var audioElement = document.createElement('audio');
        audioElement.setAttribute("id", audioItems[soundId]);
        audioElement.setAttribute("src", audioSrc[soundId]);
        if (soundId == SOUND_STARTGAME) {
            audioElement.setAttribute("preload", "auto");
            audioElement.setAttribute("autoplay", "autoplay");
        } else {
            audioElement.setAttribute("preload", "none");
        }
        document.body.appendChild(audioElement);
    }

    /**
     * Plays sounds base on their ID
     */
    function playSound(soundId) {
        var audioElement = document.getElementById(audioItems[soundId]);
        audioElement.pause();
        audioElement.play();
    }
    
    /**
     * This function prepares the graphical elements of Victory-screen.
     */
    function prepareVictoryScreen() {
        // Draw the curved YOU WIN text.
        var drawer = new CurvedTextDrawer(document.getElementById("curvedText"));
        var centerPos = drawer.getCanvasCenterPos();
        centerPos.mY = -625;
        drawer.useFont = '70px Romantiques';
        drawer.drawSectorArc("YOU WIN", centerPos.mX, centerPos.mY, 780, 180, 270, 'ccw', true, 'center');
        
        $("#homebutton_backtomain").hide();
    }
    
    /**
     * Reads the level lock status from local storage and sets the card element styles
     * accordingly.
     */
    function prepareSelectLevelScreen() {
        console.log("--> prepareSelectLevelScreen()");
        var lockedLevels = localStorage.getItem(LOCAL_STORAGE_KEY);
        for (var i=1; i < levelLockingStatus.length; ++i) {
            if (lockedLevels != undefined && lockedLevels != null && lockedLevels.length > i) {
                console.log("    read data: " + lockedLevels);
                if (lockedLevels[i] == '0') {
                    levelLockingStatus[i] = false;
                } else {
                    levelLockingStatus[i] = true;
                }
            } else {
                levelLockingStatus[i] = true;
            }
            var cardElement = $("#selLevel_levelCard"+(i+1));
            cardElement.removeClass(LOCKED_LEVELCARD_STYLE);
            if (levelLockingStatus[i]) {
                cardElement.addClass(LOCKED_LEVELCARD_STYLE);
            }
        }
        console.log("<-- prepareSelectLevelScreen()");
    }
    
    /**
     * Saves the level lock status to local storage.
     */
    function saveStatus() {
        console.log("--> saveStatus()");
        var lockedLevelsStr = '0';
        for (var i = 1; i < levelLockingStatus.length; ++i) {
            if (levelLockingStatus[i]) {
                console.log("    level: " + i + ", lock: locked");
                lockedLevelsStr += '1';
            } else {
                console.log("    level: " + i + ", lock: unlocked");
                lockedLevelsStr += '0';
            }
        }
        console.log("    data: " + lockedLevelsStr);
        localStorage.setItem(LOCAL_STORAGE_KEY, lockedLevelsStr);
        console.log("<-- saveStatus()");
    }
    
    
    /**
     * Returns the card object of the card whose DIV element has given ID.
     * @param   cardDivName     Name of the cards div element.
     * @return  The matching Card object or undefined if card was not found.
     */
    function getCardObject(cardDivName) {
        for (var i=0; i < cardsArray.length; ++i) {
            var card = cardsArray[i];
            if (card.cardId == cardDivName) {
                return card;
            }
        }
        return undefined;
    }
    
    /**
     * Marks the cards as found ones and changes the graphics.
     * @param   card1           First one of the found cards.
     * @param   card2           Second one of the found cards.
     */
    function matchFound(card1, card2) {
        card1.found = true;
        card2.found = true;
        
        // Change the graphics to glowing ones.
        var gfxIndex = card1.cardType;
        $(card1.cardId).children(".back").css("visibility", "hidden");
        $(card2.cardId).children(".back").css("visibility", "hidden");
        $(card1.cardFrontId).css("background", "url("+glowingCardImages[gfxIndex]+")");
        $(card2.cardFrontId).css("background", "url("+glowingCardImages[gfxIndex]+")");
    }
    
    /**
     * Checks the states of the cards and tells if all the pairs have been found.
     * @return  true if all the pairs have been found.
     */
    function allPairsFound() {
        for (var i=0; i < cardsArray.length; ++i) {
            var card = cardsArray[i];
            if (card.found == false) {
                return false;
            }
        }
        return true;
    }
    
    
    /**
     * A callback function that gets called when card rotation animation ends. This
     * function checks if two rotated cards are pairs.
     */
    function flipCallback() {
        console.log("--> Game.flipCallback()");
        if (firstFlippedCard == undefined) {
            // This is the first card being turned.
            firstFlippedCard = clickedCardElement;
            clickedCardElement = undefined;
            ignoreInputs = false;
            
        } else {
            // This is the second card being turned. Check if they are equal.
            var cardObj1 = getCardObject("#" + firstFlippedCard.attr("id"));
            var cardObj2 = getCardObject("#" + clickedCardElement.attr("id"));
            if (cardObj1.cardType == cardObj2.cardType) {
                matchFound(cardObj1, cardObj2);
                if (allPairsFound()) {
                    gotoNextGame();
                }
                ignoreInputs = false;
                firstFlippedCard = undefined;
                clickedCardElement = undefined;
                
            } else {
                console.log("    no match");
                window.setTimeout("Game.flipDelayCallback()", 300);
            }
        }
        console.log("<-- Game.flipCallback()");
    }
    
    /**
     * Callbackfunction that rotates the two latest cards upside down again.
     */
    function flipDelayCallback() {
        ignoreInputs = false;
        firstFlippedCard.removeClass(SHOWCARD_STYLE);
        clickedCardElement.removeClass(SHOWCARD_STYLE);
        firstFlippedCard = undefined;
        clickedCardElement = undefined;
    }

    /**
     * Shuffles the cards in the beginning of the game.
     * @param   cardsArray      Array that contains the card objects.
     */
    function shuffleLevel(cardsArray) {
        console.log("--> shuffleLevel1()");
        // Make an array that contains 2 copies of card type ids.
        var typeIndexArray = new Array();
        for (var i=0; i < cardsArray.length; ++i) {
            typeIndexArray.push( (Math.floor(i / 2)) % normalCardImages.length );
        }
        for (var i=0; i < typeIndexArray.length; ++i) {
            var swapWithIndex = Math.floor(Math.random() * 11);
            var tmpValue = typeIndexArray[swapWithIndex];
            typeIndexArray[swapWithIndex] = typeIndexArray[i];
            typeIndexArray[i] = tmpValue;
        }
        var elemIndex = 0;
        for (var i=0; i < cardsArray.length; ++i) {
            var gfxIndex = typeIndexArray.pop();
            var card = cardsArray[i];
            card.cardType = gfxIndex;
            console.log("elementId: " + card.cardFrontId + ",    graphics: " + normalCardImages[gfxIndex]);
            $(card.cardFrontId).css("background", "url("+normalCardImages[gfxIndex]+")");
            $(card.cardId).removeClass(SHOWCARD_STYLE);
        }
        console.log("<-- shuffleLevel1()");
    }

    /**
     * This should be called when game has been played through. It does the actions that are
     * needed to handle game and level progress and also showing victory screen.
     */
    function gotoNextGame() {
        console.log("--> gotoNextGame()");
        if (levelNumber == 4) {
            levelLockingStatus[0] = false;
            levelLockingStatus[1] = false;
            levelLockingStatus[2] = false;
            levelLockingStatus[3] = false;
            saveStatus();
            // Currently finished level was 4. It means that player has finished the game.
            prepareVictoryScreen();
            createSoundElement(SOUND_VICTORY);
            playSound(SOUND_VICTORY);
            $("#level4").hide();
            $("#victory").show();
            return;
        }
        passedGames++;
        var levelOfNextGame = levelNumber;
        if (passedGames >= GAMES_PER_LEVEL) {
            // Move to next level.
            passedGames = 0;
            levelOfNextGame++;
            
            // Next level unlocked.
            levelLockingStatus[levelNumber] = false;
            if (levelOfNextGame != 4) {
                playSound(SOUND_LEVEL_WON);
            }
        } 
        if (levelOfNextGame == 4) {
            // Show intro view before entring the final level.
            levelLockingStatus[3] = false;
            createSoundElement(SOUND_FINALEINTRO);
            playSound(SOUND_FINALEINTRO);
            $("#homebutton_backtomain").hide();
            $("#handitem").hide();
            $("#level3").hide();
            $("#finaleIntro").show();
        } else {
            startGame(levelOfNextGame, false);
        }
        saveStatus();
        console.log("<-- gotoNextGame()");
    }
    
    /**
     * A callback function that gets called when level selection animation has ended.
     */
    function levelSelectionAnimCallback() {
        console.log("--> levelSelectionAnimCallback()");
        $("#selLevel_page").hide();
        $("#selLevel_levelCard1").removeClass("selLevel_selectedCard selLevel_anim1 selLevel_anim2 selLevel_anim3 selLevel_anim4");
        $("#selLevel_levelCard2").removeClass("selLevel_selectedCard selLevel_anim1 selLevel_anim2 selLevel_anim3 selLevel_anim4");
        $("#selLevel_levelCard3").removeClass("selLevel_selectedCard selLevel_anim1 selLevel_anim2 selLevel_anim3 selLevel_anim4");
        $("#selLevel_levelCard4").removeClass("selLevel_selectedCard selLevel_anim1 selLevel_anim2 selLevel_anim3 selLevel_anim4");
        startGame(levelSelectionUserChoice, true);
        playSound(SOUND_LEVEL_WON);
        console.log("<-- levelSelectionAnimCallback()");
    }
    
    /**
     * Initializes the structures to start new game.
     * @param   levelNum        The level that will be started.
     * @param   resteState      Pass true to reset the game counts to 0.
     */
    function startGame(levelNum, resetState) {
        console.log("--> startGame()");
        if (resetState) {
            passGames = 0;
        }       

        // Figure out the amount of cards needed in this level.
        var cardBgGraphics = "url(images/card_purple.png)"
        cardsArray = new Array();
        levelNumber = levelNum;
        var numOfCards = 12;
        if (levelNum == 2) {
            numOfCards = 18;
            cardBgGraphics = "url(images/card_green.png)"
        } else if (levelNum == 3) {
            numOfCards = 24;
            cardBgGraphics = "url(images/card_red.png)"
        } else if (levelNum == 4) {
            numOfCards = 24;
            cardBgGraphics = "url(images/card_teal.png)"
        }
        // Create card objects.
        for (var i=0; i < numOfCards; ++i) {
            var card = new Card();
            card.cardFrontId = "#level"+levelNum+"_card_"+(i+1)+"_front";
            card.cardId = "#" + $(card.cardFrontId).parent().attr("id");
            cardsArray.push(card);

            // Manually set toggle the card backgrounds between invisible
            // background and real card background. We can't use plain css
            // because the backface-visibility during rotation does not
            // work in linux Chrome as it should.
            $(card.cardId).children(".back").css("visibility", "visible");
        }
        setTimeout(function() {shuffleLevel(cardsArray);}, 300);
        $(".card").removeClass(SHOWCARD_STYLE);
        firstFlippedCard = undefined;
        clickedCardElement = undefined;
        
        
        // Update the hand that holds the game count note.
        var starIconName = stariconsList[levelNum-1];
        for (var gameIndex = 0; gameIndex < 3; ++gameIndex) {
            var starImgElement = $("#handleitem_star"+(gameIndex+1));
            starImgElement.removeClass("unplayedGameStar");
            if (gameIndex <= passedGames) {
                starImgElement.attr("src", starIconName);
                
            } else {
                starImgElement.addClass("unplayedGameStar");
                starImgElement.attr("src", "images/star.png");
            }
        }
        if (levelNum != 4) {
            $("#handitem").css("display", "block");
        } else {
            // The hand image is not shown in final level.
            $("#handitem").hide();
        }
        
        // Control the level elements visibility.
        for (var i=1; i < 5; ++i) {
            if (i == levelNum) {
                $("#level"+i).show();
            } else {
                $("#level"+i).hide();
            }
        }
        if (passedGames == 0) {
            $("#handitem_gamenum_title").text("GAME 1");
        } else if (passedGames == 1) {
            $("#handitem_gamenum_title").text("GAME 2");
        } else if (passedGames == 2) {
            $("#handitem_gamenum_title").text("GAME 3");
        }

        $("#homebutton_backtomain").show();
        console.log("<-- startGame()");
    }

    function introViewSkipCallback() {
        prepareSelectLevelScreen();
        if ($("#main_page").is(":visible")) {
            $("#main_page").hide();
            $("#selLevel_page").show();
        }
        license_init("license", "pagebg");
        help_init("main_help", "help_");
        createSoundElement(SOUND_FLIPCARD1);
        createSoundElement(SOUND_FLIPCARD2);
        createSoundElement(SOUND_LEVEL_WON);
    }
    
    // Initialize game once everything has been loaded.
    $(document).ready(function () {
        console.log("--> document.ready()");

        createSoundElement(SOUND_STARTGAME);
        
        // Add the event handler functions.
        $("#main_page").click(function () {
            // Hide mainview and show level selection.
            introViewSkipCallback();
        });
        
        $("#selLevel_levelCard1").click(function () {
            // Start game.
            levelSelectionUserChoice = 1;
            playSound(SOUND_FLIPCARD2);
            $("#selLevel_levelCard1").addClass("selLevel_selectedCard");
            $("#selLevel_levelCard2").addClass("selLevel_anim1");
            $("#selLevel_levelCard3").addClass("selLevel_anim1");
            $("#selLevel_levelCard4").addClass("selLevel_anim1");
            window.setTimeout("Game.levelSelectionAnimCallback()", 1000);
        });
        $("#selLevel_levelCard2").click(function() {
            if ($(this).hasClass(LOCKED_LEVELCARD_STYLE) == false) {
                playSound(SOUND_FLIPCARD2);
                levelSelectionUserChoice = 2;
                $("#selLevel_levelCard2").addClass("selLevel_selectedCard");
                $("#selLevel_levelCard1").addClass("selLevel_anim2");
                $("#selLevel_levelCard3").addClass("selLevel_anim2");
                $("#selLevel_levelCard4").addClass("selLevel_anim2");
                window.setTimeout("Game.levelSelectionAnimCallback()", 1000);
            }
        });
        $("#selLevel_levelCard3").click(function() {
            if ($(this).hasClass(LOCKED_LEVELCARD_STYLE) == false) {
                playSound(SOUND_FLIPCARD2);
                levelSelectionUserChoice = 3;
                $("#selLevel_levelCard3").addClass("selLevel_selectedCard");
                $("#selLevel_levelCard1").addClass("selLevel_anim3");
                $("#selLevel_levelCard2").addClass("selLevel_anim3");
                $("#selLevel_levelCard4").addClass("selLevel_anim3");
                window.setTimeout("Game.levelSelectionAnimCallback()", 1000);
            }
        });
        $("#selLevel_levelCard4").click(function() {
            if ($(this).hasClass(LOCKED_LEVELCARD_STYLE) == false) {
                playSound(SOUND_FLIPCARD2);
                levelSelectionUserChoice = 4;
                $("#selLevel_levelCard4").addClass("selLevel_selectedCard");
                $("#selLevel_levelCard1").addClass("selLevel_anim4");
                $("#selLevel_levelCard2").addClass("selLevel_anim4");
                $("#selLevel_levelCard3").addClass("selLevel_anim4");
                window.setTimeout("Game.levelSelectionAnimCallback()", 1000);
            }
        });
        
        $(".card").click(function() {
            console.log("--> card.click()");
            if (!ignoreInputs && !($(this).hasClass(SHOWCARD_STYLE))) {
                // We have to use 2 different audio items for flip sound because
                // audio API doesn't replay the sound if it is already playing.
                if (lastPlayedFlipSound == SOUND_FLIPCARD1) {
                    lastPlayedFlipSound = SOUND_FLIPCARD2;
                } else {
                    lastPlayedFlipSound = SOUND_FLIPCARD1;
                }
                createSoundElement(SOUND_FLIPCARD1);
                playSound(lastPlayedFlipSound);
                clickedCardElement = $(this);
                ignoreInputs = true;
                console.log("    card id: " + $(this).attr("id"));
                $(this).addClass(SHOWCARD_STYLE);
                window.setTimeout("Game.flipCallback()", 350);
            }
            console.log("<-- card.click()");
        });
        
        $("#finaleIntro").click( function() {
            // Start playing final level.
            $("#finaleIntro").hide();
            startGame(4, false);
        });
        
        $("#victory_playagain_box").click(function() {
            console.log("--> victory_playagain_box.click()");
            prepareSelectLevelScreen();
            $("#victory").hide();
            $("#selLevel_page").show();
            console.log("<-- victory_playagain_box.click()");
        });
        
        $("#homebutton_backtomain").click(function() {
            console.log("--> homebutton.click()");
            // Hide current levels and show mainpage.
            $("#level1").hide();
            $("#level2").hide();
            $("#level3").hide();
            $("#level4").hide();
            $("#handitem").hide();
            $("#main_page").show();
            $(this).hide();
            console.log("<-- homebutton.click()");
        });
        
        $("#selLevel_resetLocked").click(function() {
            localStorage.setItem(LOCAL_STORAGE_KEY, '0000');
            prepareSelectLevelScreen();
        });
    });

    // Skip the welcome screen after a while.
    window.setTimeout("Game.introViewSkipCallback()", 3500);
})();
