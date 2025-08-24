Module.register("MMM-TouchScreens", {
	defaults: {
		screens: [],
		animationDuration: 300,
		swipeThreshold: 50,
		autoRotate: false,
		autoRotateDelay: 10000,
		showIndicators: true,
		enableKeyboardNav: true,
		debug: false
	},

	requiresVersion: "2.1.0",

	start: function() {
		Log.info("Starting module: " + this.name);
		
		this.currentScreen = 0;
		this.screens = this.config.screens || [];
		this.touchStartX = null;
		this.touchStartY = null;
		this.touchEndX = null;
		this.touchEndY = null;
		this.isSwiping = false;
		this.autoRotateTimer = null;
		
		if (this.config.debug) {
			Log.info("MMM-TouchScreens config:", this.config);
		}
		
		this.sendNotification("MODULE_DOM_CREATED");
	},

	getStyles: function() {
		return ["MMM-TouchScreens.css"];
	},

	getScripts: function() {
		return [];
	},

	getDom: function() {
		const wrapper = document.createElement("div");
		wrapper.className = "MMM-TouchScreens";
		wrapper.id = "mmm-touchscreens-wrapper";
		
		const screensContainer = document.createElement("div");
		screensContainer.className = "screens-container";
		screensContainer.id = "screens-container";
		
		const indicatorsContainer = document.createElement("div");
		indicatorsContainer.className = "indicators-container";
		indicatorsContainer.id = "indicators-container";
		
		if (!this.config.showIndicators) {
			indicatorsContainer.style.display = "none";
		}
		
		wrapper.appendChild(screensContainer);
		wrapper.appendChild(indicatorsContainer);
		
		return wrapper;
	},

	suspend: function() {
		if (this.config.debug) {
			Log.info("MMM-TouchScreens suspended");
		}
		this.stopAutoRotate();
	},

	resume: function() {
		if (this.config.debug) {
			Log.info("MMM-TouchScreens resumed");
		}
		if (this.config.autoRotate) {
			this.startAutoRotate();
		}
	},

	notificationReceived: function(notification, payload, sender) {
		if (this.config.debug) {
			Log.info("MMM-TouchScreens received notification:", notification);
		}
		
		switch(notification) {
			case "DOM_OBJECTS_CREATED":
				this.setupScreens();
				this.attachEventListeners();
				if (this.config.autoRotate) {
					this.startAutoRotate();
				}
				break;
			case "TOUCHSCREENS_NEXT_SCREEN":
				this.nextScreen();
				break;
			case "TOUCHSCREENS_PREVIOUS_SCREEN":
				this.previousScreen();
				break;
			case "TOUCHSCREENS_GO_TO_SCREEN":
				if (typeof payload === "number") {
					this.goToScreen(payload);
				}
				break;
			case "ALL_MODULES_STARTED":
				this.updateModuleVisibility();
				break;
		}
	},

	setupScreens: function() {
		Log.info("MMM-TouchScreens: Setting up screens");
		
		const screensContainer = document.getElementById("screens-container");
		const indicatorsContainer = document.getElementById("indicators-container");
		
		if (!screensContainer) {
			Log.error("MMM-TouchScreens: screens-container not found");
			return;
		}
		
		screensContainer.innerHTML = "";
		indicatorsContainer.innerHTML = "";
		
		if (this.screens.length === 0) {
			this.screens = this.generateDefaultScreens();
		}
		
		this.screens.forEach((screen, index) => {
			const screenDiv = document.createElement("div");
			screenDiv.className = "screen";
			screenDiv.id = `screen-${index}`;
			screenDiv.setAttribute("data-screen-index", index);
			
			if (index === this.currentScreen) {
				screenDiv.classList.add("active");
			}
			
			screensContainer.appendChild(screenDiv);
			
			if (this.config.showIndicators) {
				const indicator = document.createElement("div");
				indicator.className = "indicator";
				if (index === this.currentScreen) {
					indicator.classList.add("active");
				}
				indicator.setAttribute("data-screen-index", index);
				indicator.addEventListener("click", () => {
					this.goToScreen(index);
				});
				indicatorsContainer.appendChild(indicator);
			}
		});
		
		this.updateScreenDisplay();
	},
	
	generateDefaultScreens: function() {
		const allModules = MM.getModules();
		const screens = [];
		const modulesPerScreen = 4;
		let currentScreen = [];
		
		allModules.enumerate((module) => {
			if (module.name !== "MMM-TouchScreens") {
				currentScreen.push(module.name);
				
				if (currentScreen.length >= modulesPerScreen) {
					screens.push({
						name: `Screen ${screens.length + 1}`,
						modules: [...currentScreen]
					});
					currentScreen = [];
				}
			}
		});
		
		if (currentScreen.length > 0) {
			screens.push({
				name: `Screen ${screens.length + 1}`,
				modules: currentScreen
			});
		}
		
		if (screens.length === 0) {
			screens.push({
				name: "Home",
				modules: []
			});
		}
		
		return screens;
	},

	attachEventListeners: function() {
		Log.info("MMM-TouchScreens: Attaching event listeners");
		
		const wrapper = document.getElementById("mmm-touchscreens-wrapper");
		if (!wrapper) {
			Log.error("MMM-TouchScreens: wrapper not found");
			return;
		}
		
		wrapper.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: true });
		wrapper.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
		wrapper.addEventListener("touchend", this.handleTouchEnd.bind(this), { passive: true });
		
		wrapper.addEventListener("mousedown", this.handleMouseDown.bind(this));
		wrapper.addEventListener("mousemove", this.handleMouseMove.bind(this));
		wrapper.addEventListener("mouseup", this.handleMouseUp.bind(this));
		wrapper.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
		
		if (this.config.enableKeyboardNav) {
			document.addEventListener("keydown", this.handleKeyDown.bind(this));
		}
	},
	
	handleTouchStart: function(event) {
		this.touchStartX = event.touches[0].clientX;
		this.touchStartY = event.touches[0].clientY;
		this.touchStartTime = Date.now();
		this.isSwiping = false;
		this.stopAutoRotate();
	},
	
	handleTouchMove: function(event) {
		if (!this.touchStartX || !this.touchStartY) {
			return;
		}
		
		const touchX = event.touches[0].clientX;
		const touchY = event.touches[0].clientY;
		const diffX = this.touchStartX - touchX;
		const diffY = this.touchStartY - touchY;
		
		if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
			event.preventDefault();
			this.isSwiping = true;
			
			const screensContainer = document.getElementById("screens-container");
			if (screensContainer) {
				const translateX = -this.currentScreen * 100 - (diffX / window.innerWidth * 100);
				screensContainer.style.transform = `translateX(${translateX}%)`;
				screensContainer.style.transition = "none";
			}
		}
	},
	
	handleTouchEnd: function(event) {
		if (!this.touchStartX || !this.touchStartY) {
			return;
		}
		
		const touchEndX = event.changedTouches[0].clientX;
		const touchEndTime = Date.now();
		const diffX = this.touchStartX - touchEndX;
		const diffTime = touchEndTime - this.touchStartTime;
		const velocity = Math.abs(diffX) / diffTime;
		
		const screensContainer = document.getElementById("screens-container");
		if (screensContainer) {
			screensContainer.style.transition = "";
		}
		
		if (this.isSwiping && (Math.abs(diffX) > this.config.swipeThreshold || velocity > 0.3)) {
			if (diffX > 0) {
				this.nextScreen();
			} else {
				this.previousScreen();
			}
		} else {
			this.updateScreenDisplay();
		}
		
		this.touchStartX = null;
		this.touchStartY = null;
		this.isSwiping = false;
		
		if (this.config.autoRotate) {
			this.startAutoRotate();
		}
	},
	
	handleMouseDown: function(event) {
		this.mouseStartX = event.clientX;
		this.mouseStartY = event.clientY;
		this.isMouseDragging = true;
		this.stopAutoRotate();
		event.preventDefault();
	},
	
	handleMouseMove: function(event) {
		if (!this.isMouseDragging || !this.mouseStartX) {
			return;
		}
		
		const diffX = this.mouseStartX - event.clientX;
		const diffY = this.mouseStartY - event.clientY;
		
		if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
			this.isSwiping = true;
			
			const screensContainer = document.getElementById("screens-container");
			if (screensContainer) {
				const translateX = -this.currentScreen * 100 - (diffX / window.innerWidth * 100);
				screensContainer.style.transform = `translateX(${translateX}%)`;
				screensContainer.style.transition = "none";
			}
		}
	},
	
	handleMouseUp: function(event) {
		if (!this.isMouseDragging) {
			return;
		}
		
		const diffX = this.mouseStartX - event.clientX;
		
		const screensContainer = document.getElementById("screens-container");
		if (screensContainer) {
			screensContainer.style.transition = "";
		}
		
		if (this.isSwiping && Math.abs(diffX) > this.config.swipeThreshold) {
			if (diffX > 0) {
				this.nextScreen();
			} else {
				this.previousScreen();
			}
		} else {
			this.updateScreenDisplay();
		}
		
		this.mouseStartX = null;
		this.mouseStartY = null;
		this.isMouseDragging = false;
		this.isSwiping = false;
		
		if (this.config.autoRotate) {
			this.startAutoRotate();
		}
	},
	
	handleMouseLeave: function(event) {
		if (this.isMouseDragging) {
			this.handleMouseUp(event);
		}
	},
	
	handleKeyDown: function(event) {
		switch(event.key) {
			case "ArrowLeft":
				event.preventDefault();
				this.previousScreen();
				break;
			case "ArrowRight":
				event.preventDefault();
				this.nextScreen();
				break;
			case "Home":
				event.preventDefault();
				this.goToScreen(0);
				break;
			case "End":
				event.preventDefault();
				this.goToScreen(this.screens.length - 1);
				break;
		}
	},

	nextScreen: function() {
		const nextIndex = (this.currentScreen + 1) % this.screens.length;
		this.goToScreen(nextIndex);
	},

	previousScreen: function() {
		const prevIndex = (this.currentScreen - 1 + this.screens.length) % this.screens.length;
		this.goToScreen(prevIndex);
	},

	goToScreen: function(index) {
		if (index >= 0 && index < this.screens.length && index !== this.currentScreen) {
			this.currentScreen = index;
			this.updateScreenDisplay();
			this.updateModuleVisibility();
			this.sendNotification("TOUCHSCREENS_SCREEN_CHANGED", {
				screen: index,
				totalScreens: this.screens.length
			});
		}
	},

	updateScreenDisplay: function() {
		Log.info("MMM-TouchScreens: Updating screen display to screen " + this.currentScreen);
		
		const screensContainer = document.getElementById("screens-container");
		if (screensContainer) {
			const translateX = -this.currentScreen * 100;
			screensContainer.style.transform = `translateX(${translateX}%)`;
		}
		
		const screens = document.querySelectorAll(".MMM-TouchScreens .screen");
		screens.forEach((screen, index) => {
			if (index === this.currentScreen) {
				screen.classList.add("active");
			} else {
				screen.classList.remove("active");
			}
		});
		
		const indicators = document.querySelectorAll(".MMM-TouchScreens .indicator");
		indicators.forEach((indicator, index) => {
			if (index === this.currentScreen) {
				indicator.classList.add("active");
			} else {
				indicator.classList.remove("active");
			}
		});
	},

	updateModuleVisibility: function() {
		Log.info("MMM-TouchScreens: Updating module visibility for screen " + this.currentScreen);
		
		if (!this.screens || this.screens.length === 0) {
			return;
		}
		
		const currentScreenConfig = this.screens[this.currentScreen];
		if (!currentScreenConfig) {
			return;
		}
		
		const allModules = MM.getModules();
		
		allModules.enumerate((module) => {
			if (module.name === "MMM-TouchScreens") {
				return;
			}
			
			const shouldBeVisible = this.isModuleOnCurrentScreen(module, currentScreenConfig);
			
			if (shouldBeVisible) {
				this.showModule(module);
			} else {
				this.hideModule(module);
			}
		});
	},
	
	isModuleOnCurrentScreen: function(module, screenConfig) {
		if (!screenConfig.modules || screenConfig.modules.length === 0) {
			return false;
		}
		
		if (screenConfig.modules.includes("all")) {
			return true;
		}
		
		if (screenConfig.modules.includes(module.name)) {
			return true;
		}
		
		const moduleClasses = module.data.classes ? module.data.classes.split(" ") : [];
		for (let moduleClass of moduleClasses) {
			if (screenConfig.modules.includes(moduleClass)) {
				return true;
			}
		}
		
		const modulePosition = module.data.position;
		if (modulePosition && screenConfig.modules.includes(modulePosition)) {
			return true;
		}
		
		return false;
	},
	
	showModule: function(module) {
		if (module.hidden) {
			module.show(this.config.animationDuration, () => {
				Log.info(`MMM-TouchScreens: Showed module ${module.name}`);
			});
		}
	},
	
	hideModule: function(module) {
		if (!module.hidden) {
			module.hide(this.config.animationDuration, () => {
				Log.info(`MMM-TouchScreens: Hid module ${module.name}`);
			});
		}
	},

	startAutoRotate: function() {
		if (this.config.autoRotate && !this.autoRotateTimer) {
			this.autoRotateTimer = setInterval(() => {
				this.nextScreen();
			}, this.config.autoRotateDelay);
		}
	},

	stopAutoRotate: function() {
		if (this.autoRotateTimer) {
			clearInterval(this.autoRotateTimer);
			this.autoRotateTimer = null;
		}
	}
});