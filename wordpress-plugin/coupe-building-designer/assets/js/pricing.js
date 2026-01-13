/**
 * Coupe Building Designer - Pricing Logic
 * Updated with Advanced Features (Wainscot, Accessories, etc)
 */
(function (window) {
    'use strict';

    const CoupePricing = {
        config: {
            basePricePerSqFt: 15,
            trussSpacing: { '4': 1.0, '6': 0.95, '8': 0.90, '9': 0.88 },
            floorFinish: { 'dirt-gravel': 0, 'concrete': 3.5 },
            thickenedEdgeSlab: 12,
            postConstructionSlab: 4.5,
            sidewallPosts: { '4x6': 45, '6x6': 65, 'columns': 120 },
            clearHeight: { '8': 1.0, '10': 1.15, '12': 1.30, '14': 1.45, '16': 1.60, '18': 1.75, '20': 1.90 },
            girtType: { 'flat': 2.5, 'bookshelf': 3.5, 'double': 4.5 },
            gradeBoard: { '2x6': 3.0, '2x8': 4.0 },
            overhang: { '0': 0, '1': 8, '2': 15 },
            sitePreparation: 500,

            // New Items
            wainscotPerLinFt: 12,
            gableAccent: 400, // Fixed price per accent? Or calculated.
            cupolas: { 'None': 0, 'Small': 400, 'Medium': 600, 'Large': 800 },
            guttersPerLinFt: 5,
            snowGuards: 250, // Flat fee or per ft?
            insulation: {
                wall: { 'None': 0, '6" Batt 23"': 2.0, "4' Wide Roll": 1.5 },
                ceiling: { 'None': 0, 'Blow-In': 2.5, 'Batt': 2.0 }
            }
        },

        calculate: function (specs) {
            const width = parseFloat(specs.width) || 0;
            const length = parseFloat(specs.length) || 0;
            const sqft = width * length;
            const perimeter = (width + length) * 2;

            let total = 0;

            // Base & Multipliers
            total += sqft * this.config.basePricePerSqFt;
            if (this.config.trussSpacing[specs.trussSpacing]) total *= this.config.trussSpacing[specs.trussSpacing];
            if (this.config.clearHeight[specs.clearHeight]) total *= this.config.clearHeight[specs.clearHeight];

            // Floor & Foundation
            if (this.config.floorFinish[specs.floorFinish]) total += sqft * this.config.floorFinish[specs.floorFinish];
            if (specs.thickenedEdgeSlab) total += perimeter * this.config.thickenedEdgeSlab;
            if (specs.postConstructionSlab) total += sqft * this.config.postConstructionSlab;
            if (specs.sitePreparation) total += this.config.sitePreparation;

            // Structure
            const numPosts = Math.ceil(perimeter / 8);
            if (this.config.sidewallPosts[specs.sidewallPosts]) total += numPosts * this.config.sidewallPosts[specs.sidewallPosts];
            if (this.config.girtType[specs.girtType]) total += perimeter * this.config.girtType[specs.girtType];
            if (this.config.gradeBoard[specs.gradeBoard]) total += perimeter * this.config.gradeBoard[specs.gradeBoard];

            // Overhangs
            if (this.config.overhang[specs.endWallOverhang]) total += width * 2 * this.config.overhang[specs.endWallOverhang];
            if (this.config.overhang[specs.sidewallOverhang]) total += length * 2 * this.config.overhang[specs.sidewallOverhang];

            // Advanced Features
            if (specs.wainscot) {
                total += perimeter * this.config.wainscotPerLinFt;
            }
            if (specs.gableAccent) {
                total += this.config.gableAccent;
                // Could verify if both ends or one, logic simplified
            }
            if (specs.cupolas && this.config.cupolas[specs.cupolas]) {
                total += this.config.cupolas[specs.cupolas];
            }
            if (specs.gutters === 'Yes') {
                total += length * 2 * this.config.guttersPerLinFt;
            }
            if (specs.snowGuards === 'Yes') {
                total += this.config.snowGuards;
            }

            // Openings
            if (specs.openings && Array.isArray(specs.openings)) {
                specs.openings.forEach(op => {
                    if (op.price) total += op.price;
                });
            }

            return Math.round(total * 100) / 100;
        }
    };

    window.CoupePricing = CoupePricing;

})(window);
