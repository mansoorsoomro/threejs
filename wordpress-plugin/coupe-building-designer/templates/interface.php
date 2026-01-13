<!-- Coupe Building Designer Interface -->
<div id="coupe-building-designer" class="coupe-container">
    <div class="coupe-layout">
        
        <!-- Sidebar Controls -->
        <div class="coupe-sidebar">
            <h2 class="coupe-title">Building Designer</h2>
            
            <form id="coupe-design-form">
                
                <!-- TABS HEADER -->
                <div class="coupe-tabs-header">
                    <button type="button" class="coupe-tab-link active" data-tab="tab-dimensions">Dimensions</button>
                    <button type="button" class="coupe-tab-link" data-tab="tab-structure">Structure</button>
                    <button type="button" class="coupe-tab-link" data-tab="tab-colors">Colors</button>
                    <button type="button" class="coupe-tab-link" data-tab="tab-accessories">Accessories</button>
                </div>

                <div class="coupe-tabs-body">
                    
                    <!-- TAB 1: DIMENSIONS -->
                    <div id="tab-dimensions" class="coupe-tab-content active">
                        <div class="coupe-form-group">
                            <label for="buildingUse">Building Use</label>
                            <select id="buildingUse" name="buildingUse">
                                <option value="residential">Residential</option>
                                <option value="storage">Storage</option>
                                <option value="agricultural">Agricultural</option>
                                <option value="barndominium">Barndominium</option>
                            </select>
                        </div>
                        <div class="coupe-form-group">
                            <label for="width">Width (ft)</label>
                            <input type="number" id="width" name="width" value="24" min="20" max="60" step="2">
                        </div>
                        <div class="coupe-form-group">
                            <label for="length">Length (ft)</label>
                            <input type="number" id="length" name="length" value="30" min="20" max="200" step="2">
                        </div>
                        <div class="coupe-form-group">
                            <label for="height">Height (ft)</label>
                            <select id="height" name="height">
                                <option value="8">8'</option>
                                <option value="10">10'</option>
                                <option value="12" selected>12'</option>
                                <option value="14">14'</option>
                                <option value="16">16'</option>
                                <option value="18">18'</option>
                                <option value="20">20'</option>
                            </select>
                        </div>
                    </div>

                    <!-- TAB 2: STRUCTURE -->
                    <div id="tab-structure" class="coupe-tab-content">
                        <div class="coupe-form-group">
                            <label for="trussSpacing">Truss Spacing</label>
                            <select id="trussSpacing" name="trussSpacing">
                                <option value="4">4'</option>
                                <option value="6" selected>6'</option>
                                <option value="8">8'</option>
                            </select>
                        </div>
                        <div class="coupe-form-group">
                            <label for="floorFinish">Floor Finish</label>
                            <select id="floorFinish" name="floorFinish">
                                <option value="dirt-gravel">Dirt/Gravel</option>
                                <option value="concrete">Concrete</option>
                            </select>
                        </div>
                        <div class="coupe-form-group">
                            <label>Foundation Options</label>
                            <div class="coupe-checkbox-group">
                                <label><input type="checkbox" name="sitePreparation" value="true"> Site Prep</label>
                                <label><input type="checkbox" name="thickenedEdgeSlab" value="true"> Thickened Edge</label>
                                <label><input type="checkbox" name="postConstructionSlab" value="true"> Post Const. Slab</label>
                            </div>
                        </div>
                         <div class="coupe-form-group">
                            <label for="sidewallPosts">Sidewall Posts</label>
                            <select id="sidewallPosts" name="sidewallPosts">
                                <option value="4x6">4x6</option>
                                <option value="6x6">6x6</option>
                                <option value="columns">Columns</option>
                            </select>
                        </div>
                         <div class="coupe-form-group">
                            <label for="girtType">Girt Type</label>
                            <select id="girtType" name="girtType">
                                <option value="flat">Flat</option>
                                <option value="bookshelf">Bookshelf</option>
                                <option value="double">Double</option>
                            </select>
                        </div>
                        <div class="coupe-form-group">
                            <label for="endWallOverhang">End Wall Overhang</label>
                            <select id="endWallOverhang" name="endWallOverhang">
                                <option value="0">0'</option>
                                <option value="1">1'</option>
                                <option value="2">2'</option>
                            </select>
                        </div>
                        <div class="coupe-form-group">
                            <label for="sidewallOverhang">Sidewall Overhang</label>
                            <select id="sidewallOverhang" name="sidewallOverhang">
                                <option value="0">0'</option>
                                <option value="1">1'</option>
                                <option value="2">2'</option>
                            </select>
                        </div>
                         <!-- Open Walls -->
                         <div class="coupe-form-group">
                            <label>Open Walls</label>
                            <select id="openWalls_isOpen" name="openWalls_isOpen">
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                            <div id="openWalls-options" style="display:none; padding-left: 10px; margin-top: 5px;">
                                <label><input type="checkbox" name="openWalls_sideWallA" value="true"> Side Wall A (Left)</label><br>
                                <label><input type="checkbox" name="openWalls_sideWallB" value="true"> Side Wall B (Right)</label><br>
                                <label><input type="checkbox" name="openWalls_endWallC" value="true"> End Wall C (Front)</label><br>
                                <label><input type="checkbox" name="openWalls_endWallD" value="true"> End Wall D (Back)</label>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 3: COLORS -->
                    <div id="tab-colors" class="coupe-tab-content">
                        <div class="coupe-form-group">
                            <label for="wallColor">Wall Color</label>
                            <select id="wallColor" name="wallColor"></select>
                        </div>
                        <div class="coupe-form-group">
                            <label for="trimColor">Trim Color</label>
                            <select id="trimColor" name="trimColor"></select>
                        </div>
                        <div class="coupe-form-group">
                            <label for="roofColor">Roof Color</label>
                            <select id="roofColor" name="roofColor"></select>
                        </div>
                        
                        <!-- Wainscot -->
                        <div class="coupe-form-group">
                            <label for="wainscot">Wainscot</label>
                             <select id="wainscot" name="wainscot">
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                            <div id="wainscot-options" style="display:none; padding-left: 10px; margin-top: 5px;">
                                <label>Height</label>
                                <select id="wainscotHeight" name="wainscotHeight">
                                    <option value="36 in">36"</option>
                                    <option value="48 in">48"</option>
                                </select>
                                <label>Color</label>
                                <select id="wainscotColor" name="wainscotColor"></select>
                            </div>
                        </div>

                         <!-- Gable Accent -->
                        <div class="coupe-form-group">
                            <label for="gableAccent">Gable Accent</label>
                             <select id="gableAccent" name="gableAccent">
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                             <div id="gableAccent-options" style="display:none; padding-left: 10px; margin-top: 5px;">
                                <label>Color</label>
                                <select id="gableAccentColor" name="gableAccentColor"></select>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 4: ACCESSORIES -->
                    <div id="tab-accessories" class="coupe-tab-content">
                         <div class="coupe-form-group">
                             <label for="cupolas">Cupolas</label>
                             <select id="cupolas" name="cupolas">
                                 <option value="None">None</option>
                                 <option value="Small">Small</option>
                                 <option value="Medium">Medium</option>
                                 <option value="Large">Large</option>
                             </select>
                         </div>
                         <div class="coupe-form-group">
                             <label for="snowGuards">Snow Guards</label>
                             <select id="snowGuards" name="snowGuards">
                                 <option value="No">No</option>
                                 <option value="Yes">Yes</option>
                             </select>
                         </div>
                         <div class="coupe-form-group">
                             <label for="gutters">Gutters</label>
                             <select id="gutters" name="gutters">
                                 <option value="No">No</option>
                                 <option value="Yes">Yes</option>
                             </select>
                              <div id="gutters-options" style="display:none; margin-top:5px;">
                                 <label>Color</label>
                                 <select id="gutterColor" name="gutterColor"></select>
                             </div>
                         </div>
                         <div class="coupe-form-group">
                            <label>Openings (Windows/Doors)</label>
                            <div class="coupe-btn-group">
                                <button type="button" class="add-opening-btn" data-type="window">+ Window</button>
                                <button type="button" class="add-opening-btn" data-type="door">+ Door</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="coupe-actions" style="margin-top: 20px;">
                    <button type="submit" id="submit-design" class="coupe-submit-btn">Request Quote</button>
                </div>

            </form>
        </div>

        <!-- Main Display Area -->
        <div class="coupe-main">
            
            <!-- View Toggle -->
            <div class="coupe-view-controls">
                <button type="button" class="coupe-view-btn active" data-view="3d">3D View</button>
                <button type="button" class="coupe-view-btn" data-view="floorplan">Floor Plan</button>
            </div>

            <!-- Visualization Containers -->
            <div id="coupe-3d-container" class="coupe-viz-container"></div>
            <div id="coupe-floorplan-container" class="coupe-viz-container" style="display:none;"></div>

            <!-- Pricing Bar -->
            <div class="coupe-pricing-bar">
                <div class="coupe-pricing-row">
                    <span>Estimated Price: </span>
                    <span class="coupe-price">$<span id="live-price">0.00</span></span>
                </div>
                <div class="coupe-pricing-details">
                    <small>Design ID: <span id="design-id">---</span></small> | 
                    <small>Name: <span id="design-name">Building Design</span></small>
                </div>
            </div>

        </div>
    </div>
</div>
