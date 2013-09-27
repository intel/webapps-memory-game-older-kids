/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */


/**
 * Card class is a container of card related information. It makes it easier to
 * handle the relationships between the logical cards and HTML elements
 * relating to that card.
 */
Card = function() {
    this.cardId = "";
    this.cardFrontId = "";
    this.cardGraphics = "";
    this.cardType = -1;
    this.found = false;
}
