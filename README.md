# MMM-TouchScreens

A [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that creates multiple swipeable screens with iOS-like touch functionality. Navigate between different layouts of your MagicMirror modules using touch gestures, mouse, or keyboard.

## Features

- 📱 **iOS-like swipe gestures** - Smooth, responsive touch controls
- 🖱️ **Mouse support** - Click and drag to switch screens
- ⌨️ **Keyboard navigation** - Arrow keys for quick navigation
- 🔄 **Auto-rotation** - Automatic screen cycling with configurable delays
- 📍 **Visual indicators** - Customizable page dots showing current screen
- 🎨 **Smooth animations** - Beautiful transitions between screens
- 📊 **Flexible configuration** - Define custom screens with specific modules
- 🔔 **Notification system** - Integration with other modules via notifications

## Screenshots

![MMM-TouchScreens Demo](screenshots/demo.gif)

## Installation

1. Navigate to your MagicMirror's `modules` folder:
```bash
cd ~/MagicMirror/modules
```

2. Clone this repository:
```bash
git clone https://github.com/Liquescent/MMM-TouchScreens.git
```

3. Navigate to the module folder:
```bash
cd MMM-TouchScreens
```

4. Install dependencies (if any):
```bash
npm install
```

## Configuration

Add the module to your `config/config.js` file:

```javascript
{
  module: "MMM-TouchScreens",
  position: "fullscreen_above",
  config: {
    screens: [
      {
        name: "Home",
        modules: ["clock", "calendar", "weather"]
      },
      {
        name: "News",
        modules: ["newsfeed", "MMM-NewsAPI"]
      },
      {
        name: "System",
        modules: ["MMM-SystemStats", "MMM-NetworkScanner"]
      }
    ],
    animationDuration: 300,
    swipeThreshold: 50,
    autoRotate: false,
    autoRotateDelay: 10000,
    showIndicators: true,
    enableKeyboardNav: true,
    debug: false
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `screens` | Array | `[]` | Array of screen configurations. Each screen should have a `name` and `modules` array |
| `animationDuration` | Number | `300` | Duration of screen transition animations in milliseconds |
| `swipeThreshold` | Number | `50` | Minimum swipe distance in pixels to trigger screen change |
| `autoRotate` | Boolean | `false` | Enable automatic screen rotation |
| `autoRotateDelay` | Number | `10000` | Delay between automatic screen changes in milliseconds |
| `showIndicators` | Boolean | `true` | Show page indicator dots at the bottom |
| `enableKeyboardNav` | Boolean | `true` | Enable keyboard navigation (arrow keys) |
| `debug` | Boolean | `false` | Enable debug logging to console |

### Screen Configuration

Each screen in the `screens` array should have:

- `name`: A string identifier for the screen
- `modules`: An array of module identifiers that should be visible on this screen

Module identifiers can be:
- Module names (e.g., `"clock"`, `"calendar"`)
- Module classes (custom CSS classes assigned to modules)
- Module positions (e.g., `"top_left"`, `"bottom_right"`)
- `"all"` to show all modules on that screen

### Example: Auto-Generated Screens

If you don't specify screens in the config, the module will automatically distribute all your modules across screens:

```javascript
{
  module: "MMM-TouchScreens",
  position: "fullscreen_above",
  config: {
    // Screens will be auto-generated
    autoRotate: true,
    autoRotateDelay: 15000
  }
}
```

### Example: Real-World Configuration

Here's a practical example organizing common MagicMirror modules into themed screens:

```javascript
{
  module: "MMM-TouchScreens",
  position: "fullscreen_above",
  config: {
    screens: [
      {
        name: "All Modules",
        modules: ["all"]  // Shows everything - preserves your original layout
      },
      {
        name: "Dashboard",
        modules: ["clock", "weather", "MMM-AirNowForecast", "newsfeed"]
      },
      {
        name: "Calendar View",
        modules: ["clock", "calendar", "MMM-CalendarExt3", "MMM-CalendarExt3Timeline"]
      },
      {
        name: "Weather Station",
        modules: ["weather", "MMM-CurrentUVIndex", "MMM-AirNowForecast"]
      },
      {
        name: "System",
        modules: ["updatenotification", "alert", "MMM-mmpm"]
      }
    ],
    animationDuration: 300,
    swipeThreshold: 50,
    autoRotate: false,
    showIndicators: true,
    enableKeyboardNav: true
  }
}
```

This configuration creates five screens:
- **All Modules**: Your original MagicMirror layout with everything visible
- **Dashboard**: Quick overview with time, current weather, air quality, and news
- **Calendar View**: Focused calendar display with multiple calendar formats
- **Weather Station**: Comprehensive weather information including UV index and air quality
- **System**: Administrative modules for updates and module management

## Usage

### Touch/Mouse Controls
- **Swipe left**: Navigate to the next screen
- **Swipe right**: Navigate to the previous screen
- **Click indicators**: Jump directly to a specific screen

### Keyboard Controls
- **Arrow Left**: Previous screen
- **Arrow Right**: Next screen
- **Home**: First screen
- **End**: Last screen

## Notifications

### Sending Notifications to MMM-TouchScreens

Other modules can control screen navigation by sending notifications:

| Notification | Payload | Description |
|--------------|---------|-------------|
| `TOUCHSCREENS_NEXT_SCREEN` | None | Navigate to the next screen |
| `TOUCHSCREENS_PREVIOUS_SCREEN` | None | Navigate to the previous screen |
| `TOUCHSCREENS_GO_TO_SCREEN` | Number | Navigate to a specific screen (0-indexed) |

Example from another module:
```javascript
this.sendNotification("TOUCHSCREENS_GO_TO_SCREEN", 2); // Go to third screen
```

### Notifications Sent by MMM-TouchScreens

| Notification | Payload | Description |
|--------------|---------|-------------|
| `TOUCHSCREENS_SCREEN_CHANGED` | `{screen: Number, totalScreens: Number}` | Sent when the active screen changes |

## Advanced Configuration Examples

### Weather and News Rotation
```javascript
{
  module: "MMM-TouchScreens",
  position: "fullscreen_above",
  config: {
    screens: [
      {
        name: "Weather",
        modules: ["weather", "MMM-WeatherChart"]
      },
      {
        name: "News",
        modules: ["newsfeed", "MMM-NewsAPI"]
      }
    ],
    autoRotate: true,
    autoRotateDelay: 30000, // 30 seconds per screen
    showIndicators: true
  }
}
```

### Position-Based Screens
```javascript
{
  module: "MMM-TouchScreens",
  position: "fullscreen_above",
  config: {
    screens: [
      {
        name: "Top Modules",
        modules: ["top_left", "top_center", "top_right"]
      },
      {
        name: "Center Modules",
        modules: ["middle_center"]
      },
      {
        name: "Bottom Modules",
        modules: ["bottom_left", "bottom_center", "bottom_right"]
      }
    ]
  }
}
```

## Styling

You can customize the appearance by adding CSS to your `custom.css` file:

```css
/* Custom indicator styles */
.MMM-TouchScreens .indicator {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.5);
}

.MMM-TouchScreens .indicator.active {
  background: white;
  width: 30px;
}

/* Custom transition duration */
.MMM-TouchScreens .screens-container {
  transition: transform 0.5s ease-in-out;
}
```

## Troubleshooting

### Modules not hiding/showing correctly
- Ensure the module is positioned at `fullscreen_above`
- Check that module names in your screen configuration match exactly
- Enable debug mode to see detailed logs

### Touch gestures not working
- Verify your display supports touch input
- Check browser console for errors
- Ensure no other modules are intercepting touch events

### Performance issues
- Reduce `animationDuration` for faster transitions
- Limit the number of active modules per screen
- Consider disabling debug mode in production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Created by Liquescent

## Acknowledgments

- Thanks to the MagicMirror² community
- Inspired by iOS home screen navigation
