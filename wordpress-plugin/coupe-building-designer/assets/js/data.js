/**
 * Coupe Building Designer - Data & Configuration
 * Ported from data/menardsColors.ts and data/windowsDoors.ts
 */
(function (window) {
    'use strict';

    const CoupeData = {
        wallColors: [
            { value: 'dover-gray', label: 'Dover Gray', hex: '#808080' },
            { value: 'stone', label: 'Stone', hex: '#999999' },
            { value: 'white', label: 'White', hex: '#FFFFFF' },
            { value: 'ash-gray', label: 'Ash Gray', hex: '#808080' },
            { value: 'charcoal-gray', label: 'Charcoal Gray', hex: '#36454F' },
            { value: 'forest-green', label: 'Forest Green', hex: '#228B22' },
            { value: 'barn-red', label: 'Barn Red', hex: '#7C0A02' },
            { value: 'burgundy', label: 'Burgundy', hex: '#800020' },
            { value: 'brown', label: 'Brown', hex: '#964B00' },
            { value: 'tan', label: 'Tan', hex: '#D2B48C' },
            { value: 'light-stone', label: 'Light Stone', hex: '#C0C0C0' },
            { value: 'taupe', label: 'Taupe', hex: '#483C32' },
            { value: 'clay', label: 'Clay', hex: '#AFA9A9' },
            { value: 'black', label: 'Black', hex: '#000000' },
            { value: 'antique-bronze', label: 'Antique Bronze', hex: '#665D1E' },
            { value: 'galvalume', label: 'Galvalume', hex: '#EBEBEB' },
        ],
        roofColors: [
            { value: 'charcoal-gray', label: 'Charcoal Gray', hex: '#36454F' },
            { value: 'dover-gray', label: 'Dover Gray', hex: '#808080' },
            { value: 'stone', label: 'Stone', hex: '#999999' },
            { value: 'white', label: 'White', hex: '#FFFFFF' },
            { value: 'ash-gray', label: 'Ash Gray', hex: '#808080' },
            { value: 'forest-green', label: 'Forest Green', hex: '#228B22' },
            { value: 'barn-red', label: 'Barn Red', hex: '#7C0A02' },
            { value: 'burgundy', label: 'Burgundy', hex: '#800020' },
            { value: 'brown', label: 'Brown', hex: '#964B00' },
            { value: 'tan', label: 'Tan', hex: '#D2B48C' },
            { value: 'light-stone', label: 'Light Stone', hex: '#C0C0C0' },
            { value: 'taupe', label: 'Taupe', hex: '#483C32' },
            { value: 'clay', label: 'Clay', hex: '#AFA9A9' },
            { value: 'black', label: 'Black', hex: '#000000' },
            { value: 'antique-bronze', label: 'Antique Bronze', hex: '#665D1E' },
            { value: 'galvalume', label: 'Galvalume', hex: '#EBEBEB' },
        ],
        trimColors: [
            { value: 'white', label: 'White', hex: '#FFFFFF' },
            { value: 'dover-gray', label: 'Dover Gray', hex: '#808080' },
            { value: 'stone', label: 'Stone', hex: '#999999' },
            { value: 'ash-gray', label: 'Ash Gray', hex: '#808080' },
            { value: 'charcoal-gray', label: 'Charcoal Gray', hex: '#36454F' },
            { value: 'forest-green', label: 'Forest Green', hex: '#228B22' },
            { value: 'barn-red', label: 'Barn Red', hex: '#7C0A02' },
            { value: 'burgundy', label: 'Burgundy', hex: '#800020' },
            { value: 'brown', label: 'Brown', hex: '#964B00' },
            { value: 'tan', label: 'Tan', hex: '#D2B48C' },
            { value: 'light-stone', label: 'Light Stone', hex: '#C0C0C0' },
            { value: 'taupe', label: 'Taupe', hex: '#483C32' },
            { value: 'clay', label: 'Clay', hex: '#AFA9A9' },
            { value: 'black', label: 'Black', hex: '#000000' },
            { value: 'antique-bronze', label: 'Antique Bronze', hex: '#665D1E' },
            { value: 'galvalume', label: 'Galvalume', hex: '#EBEBEB' },
        ],
        windowOptions: [
            { id: 'w1', type: 'window', width: 2, height: 2, name: '2x2 Window', price: 150 },
            { id: 'w2', type: 'window', width: 3, height: 2, name: '3x2 Window', price: 200 },
            { id: 'w3', type: 'window', width: 4, height: 3, name: '4x3 Window', price: 280 },
            { id: 'w4', type: 'window', width: 5, height: 3, name: '5x3 Window', price: 350 },
        ],
        doorOptions: [
            { id: 'd1', type: 'door', width: 3, height: 7, name: '3x7 Walk Door', price: 450 },
            { id: 'd2', type: 'door', width: 4, height: 7, name: '4x7 Walk Door', price: 550 },
            { id: 'd3', type: 'door', width: 10, height: 10, name: '10x10 Overhead Door', price: 1200 },
            { id: 'd4', type: 'door', width: 12, height: 12, name: '12x12 Overhead Door', price: 1500 },
            { id: 'd5', type: 'door', width: 14, height: 14, name: '14x14 Overhead Door', price: 1800 },
            { id: 'd6', type: 'door', width: 16, height: 14, name: '16x14 Overhead Door', price: 2100 },
        ]
    };

    window.CoupeData = CoupeData;

})(window);
