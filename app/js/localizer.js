/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */


/**
 * Localizer is an utility that updates the UI strings with localized
 * strings.
 */
Localizer = function() {
    this.noLocalization = false; // for disabling localizations temporary
    
    this.getTranslation = function(key) {
        var text = "";
        if (this.noLocalization) {
            return text;
        }
        
        if (window.chrome && window.chrome.i18n) {
            text = chrome.i18n.getMessage(key);
        }
        return text;
    }

    this.localizeMainScreen = function() {
        if (this.noLocalization) {
            return;
        }
        $("#main_spetacular_title").text(this.getTranslation("main_title1"));
        $("#main_memory_title").text(this.getTranslation("main_title2"));
        $("#main_extravaganza_title").text(this.getTranslation("main_title3"));
    }
    
    this.localizeSelectLevelScreen = function() {
        if (this.noLocalization) {
            return;
        }
        $("#selLevel_title").text(this.getTranslation("selectlevel_title"));
        $("#selLevel_hint").text(this.getTranslation("selectlevel_hint"));
        $("#selLevel_levelCard1").text(this.getTranslation("selectlevel_num1"));
        $("#selLevel_levelCard2").text(this.getTranslation("selectlevel_num2"));
        $("#selLevel_levelCard3").text(this.getTranslation("selectlevel_num3"));
        $("#selLevel_levelCard4").text(this.getTranslation("selectlevel_num4"));
    }
    
    this.localizeGameScreen = function(levelNum, gameNum) {
        if (this.noLocalization) {
            return;
        }
        var gameNumStr = "";
        if (gameNum == 1) {
            gameNumStr = this.getTranslation("gamenum_1");
        } else if (gameNum == 2) {
            gameNumStr = this.getTranslation("gamenum_2");
        } else if (gameNum == 3) {
            gameNumStr = this.getTranslation("gamenum_3");
        }
        $("#handitem_gamenum_title").text(gameNumStr);
        
        var levelNumStr = "";
        if (levelNum == 1) {
            levelNumStr = this.getTranslation("level_1_title");
        } else if (levelNum == 2) {
            levelNumStr = this.getTranslation("level_2_title");
        } else if (levelNum == 3) {
            levelNumStr = this.getTranslation("level_3_title");
        } else if (levelNum == 4) {
            levelNumStr = this.getTranslation("level_4_title");
        }
        $("#level"+levelNum+"_indicator").text(levelNumStr);
        $("#homebutton_text").text(this.getTranslation("homebutton_label"));
    }
    
    this.localizeFinaleIntroScreen = function() {
        if (this.noLocalization) {
            return;
        }
        $("#finaleIntro_introducing_title").text(this.getTranslation("finalintro_title1"));
        $("#finaleIntro_finale_title").text(this.getTranslation("finalintro_title2"));
        $("#finaleIntro_memorymatch_title").text(this.getTranslation("finalintro_title3"));
    }
    
    this.localizeVictoryScreen = function() {
        if (this.noLocalization) {
            return;
        }
        $("#victory_playagain_title").text(this.getTranslation("victory_playagain"));
    }
    
    
    // If localizations cannot be read for some reason, we turn localization off.
    if (this.getTranslation("main_title1").length == 0) {
        this.noLocalization = true;
    }
    return this;
}
