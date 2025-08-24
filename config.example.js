/* MagicMirror² Config Example with MMM-TouchScreens
 *
 * This example shows how to integrate MMM-TouchScreens with a typical MagicMirror setup
 * organizing modules into logical screens for easy navigation.
 */

let config = {
    address: "0.0.0.0",
    port: 8080,
    basePath: "/",
    ipWhitelist: [],
    useHttps: false,
    httpsPrivateKey: "",
    httpsCertificate: "",

    language: "en",
    locale: "en-US",
    logLevel: ["INFO", "LOG", "WARN", "ERROR"],
    timeFormat: 12,
    units: "imperial",

    modules: [
        // MMM-TouchScreens module - MUST be positioned at fullscreen_above
        {
            module: "MMM-TouchScreens",
            position: "fullscreen_above",
            config: {
                screens: [
                    {
                        name: "Dashboard",
                        // Main overview screen with essential information
                        modules: ["clock", "weather", "MMM-AirNowForecast", "newsfeed"]
                    },
                    {
                        name: "Calendar",
                        // Dedicated calendar screen with all calendar views
                        modules: ["clock", "calendar", "MMM-CalendarExt3", "MMM-CalendarExt3Timeline"]
                    },
                    {
                        name: "Weather Details",
                        // Comprehensive weather information
                        modules: ["weather", "MMM-CurrentUVIndex", "MMM-AirNowForecast"]
                    },
                    {
                        name: "System",
                        // System management and notifications
                        modules: ["updatenotification", "alert", "MMM-mmpm"]
                    }
                ],
                animationDuration: 300,
                swipeThreshold: 50,
                autoRotate: false,           // Set to true for automatic rotation
                autoRotateDelay: 30000,      // 30 seconds per screen when autoRotate is true
                showIndicators: true,
                enableKeyboardNav: true,
                debug: false                 // Set to true for troubleshooting
            }
        },
        
        // System modules
        { 
            module: "MMM-mmpm" 
        },
        {
            module: "alert",
        },
        {
            module: "updatenotification",
            position: "top_bar"
        },
        
        // Time and Calendar modules
        {
            module: "clock",
            position: "top_left",
            config: {
                timezone: "America/Phoenix",
                displaySeconds: false,
                showSunTimes: true,
                lat: 33.4484,
                lon: -112.0740,
            }
        },
        {
            module: "calendar",
            position: "top_left",
            config: {
                broadcastPastEvents: true,
                fade: false,
                tableClass: "xsmall",
                calendars: [
                    {
                        symbol: "calendar-check",
                        url: "YOUR_CALENDAR_URL_1",
                        name: "family_calendar",
                        color: "purple",
                        coloredSymbol: "purple"
                    },
                    {
                        symbol: "calendar-check",
                        url: "YOUR_CALENDAR_URL_2",
                        name: "personal_calendar",
                        color: "orange",
                        coloredSymbol: "orange"
                    }
                ]
            }
        },
        {
            module: "MMM-CalendarExt3Timeline",
            position: "lower_third",
            title: "",
            config: {
                locale: 'en-US',
                staticMode: false,
                beginHour: -3,
                hourLength: 24,
                useSymbol: true,
                displayLegend: true,
                calendarSet: ['family_calendar', 'personal_calendar'],
            }
        },
        {
            module: "MMM-CalendarExt3",
            position: "lower_third",
            title: "",
            config: {
                mode: "month",
                instanceId: "basicCalendar",
                locale: 'en-US',
                maxEventLines: 5,
                firstDayOfWeek: 0,
                calendarSet: ['family_calendar', 'personal_calendar'],
            }
        },
        
        // Weather modules
        {
            module: "weather",
            position: "top_right",
            header: "Current Weather",
            config: {
                weatherProvider: "weathergov",
                type: "current",
                apiBase: 'https://api.weather.gov/points/',
                showHumidity: "feelslike",
                showSun: true,
                lat: 33.4484,
                lon: -112.0740,
            }
        },
        {
            module: "weather",
            position: "top_center",
            header: "Weather Forecast",
            config: {
                weatherProvider: "weathergov",
                colored: true,
                fade: false,
                location: "Phoenix, AZ",
                type: "forecast",
                apiBase: 'https://api.weather.gov/points/',
                lat: 33.4484,
                lon: -112.0740,
            }
        },
        {
            module: "MMM-AirNowForecast",
            position: "top_right",
            config: {
                apiKey: "YOUR_API_KEY",
                latitude: 33.4484,
                longitude: -112.0740,
                showLocation: false
            }
        },
        {
            module: "MMM-CurrentUVIndex",
            position: "top_center",
            config: {
                latitude: 33.4484,
                longitude: -112.0740,
                showForecast: true,
                showHourly: true,
                hourlyHours: 5,
                forecastDays: 5,
                colored: true
            }
        },
        
        // News module
        {
            module: "newsfeed",
            position: "bottom_bar",
            config: {
                feeds: [
                    {
                        title: "New York Times",
                        url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
                    }
                ],
                showSourceTitle: true,
                showPublishDate: true,
                broadcastNewsFeeds: true,
                broadcastNewsUpdates: true
            }
        },
    ]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}