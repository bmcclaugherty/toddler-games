/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    // document.getElementById('deviceready').classList.add('ready');
    // 
    // Initialize the main menu
    initializeMainMenu();
}

function initializeMainMenu() {
    const mainContainer = document.getElementById('app-container');
    const menuTitle = document.createElement('h1');
    menuTitle.textContent = 'Toddler Games';
    menuTitle.className = 'menu-title';
    
    const gamesList = document.createElement('div');
    gamesList.className = 'games-list';
    
    // Define available games
    const games = [
        { name: 'Drawing', id: 'drawing-game' }
    ];
    
    // Create game buttons
    games.forEach(game => {
        const gameButton = document.createElement('button');
        gameButton.textContent = game.name;
        gameButton.className = 'game-button';
        gameButton.addEventListener('click', () => launchGame(game.id));
        gamesList.appendChild(gameButton);
    });
    
    mainContainer.appendChild(menuTitle);
    mainContainer.appendChild(gamesList);
}

function launchGame(gameId) {
    console.log(`Launching game: ${gameId}`);
    switch(gameId) {
        case 'drawing-game':
            initializeDrawingGame();
            break;
        default:
            alert('Game not implemented yet!');
    }
}
