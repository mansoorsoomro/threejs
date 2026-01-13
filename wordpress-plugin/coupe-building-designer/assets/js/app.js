/**
 * Coupe Building Designer - Main Application Logic
 * Orchestrates the interaction between the form, state, and visualizers.
 */
(function ($) {
    'use strict';

    const CoupeApp = {
        state: {
            // Dimensions
            width: 24,
            length: 30,
            height: 12,

            // Structure
            trussSpacing: '6',
            floorFinish: 'dirt-gravel',
            sitePreparation: false,
            thickenedEdgeSlab: false,
            postConstructionSlab: false,
            sidewallPosts: '6x6',
            girtType: 'standard',
            endWallOverhang: '0',
            sidewallOverhang: '0',

            // Colors
            wallColor: 'ash-gray',
            trimColor: 'white',
            roofColor: 'charcoal-gray',

            // Advanced
            openWalls: {
                isOpen: false,
                sideWallA: false,
                sideWallB: false,
                endWallC: false,
                endWallD: false
            },
            wainscot: false,
            wainscotHeight: '36 in',
            wainscotColor: 'white',
            gableAccent: false,
            gableAccentColor: 'white',

            // Accessories
            cupolas: 'None',
            snowGuards: 'No',
            gutters: 'No',
            gutterColor: 'white',

            openings: []
        },

        init: function () {
            this.cacheDOM();
            this.populateDropdowns();
            this.bindEvents();
            this.initTabs();

            // Initialize Visualizers (Wait a tick for DOM)
            const self = this;
            setTimeout(function () {
                if (window.CoupeBuilding3D) window.CoupeBuilding3D.init('coupe-3d-container');
                if (window.CoupeFloorPlan) window.CoupeFloorPlan.init('coupe-floorplan-container');
                self.updateAll();
            }, 100);
        },

        cacheDOM: function () {
            this.$container = $('#coupe-building-designer');
            this.$form = $('#coupe-design-form');
            this.$priceDisplay = $('#live-price');

            // Sections
            this.$openWallsOptions = $('#openWalls-options');
            this.$wainscotOptions = $('#wainscot-options');
            this.$gableAccentOptions = $('#gableAccent-options');
            this.$guttersOptions = $('#gutters-options');
        },

        initTabs: function () {
            $('.coupe-tab-link').on('click', function () {
                const tabId = $(this).data('tab');

                // Active classes
                $('.coupe-tab-link').removeClass('active');
                $(this).addClass('active');

                $('.coupe-tab-content').removeClass('active');
                $('#' + tabId).addClass('active');
            });
        },

        populateDropdowns: function () {
            if (!window.CoupeData) return;

            const populate = ($select, options) => {
                if (!$select.length) return;
                $select.empty();
                options.forEach(opt => {
                    $select.append(new Option(opt.label, opt.value));
                });
            };

            // Main Colors
            populate($('#wallColor'), CoupeData.wallColors);
            populate($('#trimColor'), CoupeData.trimColors);
            populate($('#roofColor'), CoupeData.roofColors);

            // Sub Colors (use trim colors generally)
            populate($('#wainscotColor'), CoupeData.trimColors);
            populate($('#gableAccentColor'), CoupeData.trimColors);
            populate($('#gutterColor'), CoupeData.trimColors);

            // Set initial defaults
            $('#wallColor').val(this.state.wallColor);
            $('#trimColor').val(this.state.trimColor);
            $('#roofColor').val(this.state.roofColor);
        },

        bindEvents: function () {
            const self = this;

            // Form Changes
            this.$form.on('change', 'input, select', function (e) {
                const name = e.target.name;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                self.handleInputUpdate(name, value);
            });

            // View Switching
            $('.coupe-view-btn').on('click', function () {
                const view = $(this).data('view');
                $('.coupe-view-btn').removeClass('active');
                $(this).addClass('active');

                if (view === '3d') {
                    $('#coupe-3d-container').show();
                    $('#coupe-floorplan-container').hide();
                } else {
                    $('#coupe-3d-container').hide();
                    $('#coupe-floorplan-container').show();
                    if (window.CoupeFloorPlan && window.CoupeFloorPlan.diagram) {
                        window.CoupeFloorPlan.diagram.requestUpdate();
                    }
                }
            });

            // Openings
            $(document).on('click', '.add-opening-btn', function (e) {
                e.preventDefault();
                self.addOpening($(this).data('type'));
            });
            $(document).on('click', '.remove-opening-btn', function (e) { /* Pending impl in interface */ });

            // Submit
            this.$form.on('submit', function (e) {
                e.preventDefault();
                self.submitQuote();
            });
        },

        handleInputUpdate: function (name, value) {
            // 1. Toggles logic (Show/Hide options)
            if (name === 'openWalls_isOpen') {
                this.$openWallsOptions.toggle(value === 'true');
                this.state.openWalls.isOpen = (value === 'true');
            } else if (name === 'wainscot') {
                this.$wainscotOptions.toggle(value === 'true');
                this.state.wainscot = (value === 'true');
            } else if (name === 'gableAccent') {
                this.$gableAccentOptions.toggle(value === 'true');
                this.state.gableAccent = (value === 'true');
            } else if (name === 'gutters') {
                this.$guttersOptions.toggle(value === 'Yes'); // Yes/No for gutters
            }

            // 2. OpenWalls breakdown
            if (name.startsWith('openWalls_')) {
                const prop = name.replace('openWalls_', '');
                if (prop !== 'isOpen') {
                    this.state.openWalls[prop] = value;
                }
            } else {
                // Standard update
                this.state[name] = value;
            }

            this.updateAll();
        },

        addOpening: function (type) {
            const newOp = {
                id: 'op_' + Date.now(),
                type: type,
                wall: 'left', // default
                x: 50,
                width: type === 'door' ? 3 : 3,
                height: type === 'door' ? 7 : 3,
                price: type === 'door' ? 500 : 250
            };
            this.state.openings.push(newOp);
            this.updateAll();
        },

        updateAll: function () {
            // Pass state to visualizers
            if (window.CoupeBuilding3D) window.CoupeBuilding3D.update(this.state);
            if (window.CoupeFloorPlan) window.CoupeFloorPlan.update(this.state);

            // Calculate Pricing
            if (window.CoupePricing) {
                const price = window.CoupePricing.calculate(this.state);
                this.$priceDisplay.text(price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            }

            // Generate Design ID (Hash)
            const infoSeed = `${this.state.width}-${this.state.length}-${this.state.height}-${this.state.trussSpacing}`;
            let infoHash = 0;
            for (let i = 0; i < infoSeed.length; i++) {
                infoHash = (infoHash * 31 + infoSeed.charCodeAt(i)) | 0;
            }
            const designId = (Math.abs(infoHash) % 900000000000) + 100000000000;
            $('#design-id').text(designId);

            // Name
            let dName = 'Building Design';
            const use = $('#buildingUse').val();
            if (use === 'agricultural') dName = 'Post Frame Design';
            else if (use === 'residential') dName = 'Residential Design';
            $('#design-name').text(dName);

        },

        submitQuote: function () {
            const self = this;
            const $btn = this.$form.find('button[type="submit"]');
            $btn.prop('disabled', true).text('Sending...');

            const data = {
                action: 'coupe_submit_quote',
                security: coupeDesignerData.nonce,
                design: JSON.stringify(this.state),
                name: 'Web User' // Todo allow input
            };

            $.post(coupeDesignerData.ajaxUrl, data, function (res) {
                if (res.success) alert('Quote sent!');
                else alert('Error: ' + res.data);
            }).always(() => {
                $btn.prop('disabled', false).text('Request Quote');
            });
        }
    };

    $(document).ready(function () {
        CoupeApp.init();
    });

})(jQuery);
