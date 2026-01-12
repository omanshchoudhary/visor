# Visor

> A modern, responsive analytics dashboard built with vanilla HTML, CSS, and JavaScript

Built without frameworks to showcase clean architecture and performance-first UI engineering.

[![Status](https://img.shields.io/badge/Status-Active-success.svg)](https://visor-omansh.vercel.app)
[![Version](https://img.shields.io/badge/Version-1.0-blue.svg)](https://github.com/omanshchoudhary/visor)

**[View Live Demo](https://visor-omansh.vercel.app)** • **[Report Bug](https://github.com/omanshchoudhary/visor/issues)** • **[Request Feature](https://github.com/omanshchoudhary/visor/issues)**

---

## Overview

Visor is a full-featured analytics dashboard demonstrating modern frontend development practices using pure vanilla JavaScript. The project emphasizes clean code architecture, responsive design, and performance optimization without relying on frontend frameworks.

---

## Features

**Interface**
- Clean, professional design with smooth animations
- Fully responsive layout (desktop, tablet, mobile)
- Dark mode with system preference detection
- Accessible components with ARIA labels

**Data Visualization**
- Interactive charts powered by Chart.js
- Revenue tracking and analytics
- Conversion rate monitoring
- Product distribution analysis
- Campaign performance metrics

**Pages**

| Page | Status | Capabilities |
|------|--------|--------------|
| Dashboard | Live | Revenue stats, performance charts, campaign overview |
| Sales | Live | Conversion trends, transaction history, CSV export |
| Users | Live | User management, role assignment, status filtering |
| Settings | Live | Profile management with form validation |
| Help | Live | FAQ with expandable sections |

---

## Quick Start

**Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional)

**Installation**

```bash
# Clone repository
git clone https://github.com/omanshchoudhary/visor.git

# Navigate to directory
cd visor

# Start local server
npx http-server
```

Access at `http://localhost:8080`

---

## Project Structure

```
visor/
├── index.html              # Main dashboard
├── sales.html              # Sales analytics
├── users.html              # User management
├── settings.html           # Settings panel
├── help.html               # FAQ support
├── css/
│   ├── index.css          # Base styles
│   ├── header.css         # Header component
│   ├── sidebar.css        # Navigation
│   ├── content.css        # Main content
│   ├── theme.css          # Theme system
│   ├── responsive.css     # Media queries
│   ├── help.css           # Help styles
│   └── settings.css       # Settings styles
├── js/
│   ├── data.js            # Data processing
│   └── theme.js           # Theme management
├── data/
│   └── data.json          # Sample data (90 days)
└── assets/
    └── icons/             # SVG icons
```

---

## Technical Details

**Dashboard**
- Three key performance metrics (Revenue, Sign-ups, Conversion)
- 90-day revenue trend visualization
- Product distribution doughnut chart
- Campaign performance table with status indicators

**Sales Analytics**
- Conversion rate trend line chart
- Complete daily transaction history
- CSV export functionality for data analysis

**User Management**
- Comprehensive user listing with role indicators
- Active/Inactive status filtering
- Last activity tracking

**Settings Panel**
- Profile information management
- Client-side form validation
- Persistent settings storage

**Help Center**
- Collapsible FAQ sections
- Integrated search functionality
- Code examples and detailed explanations

---

## Design System

**Color Palette**

```css
Primary:    #6366f1  /* Indigo */
Success:    #10b981  /* Emerald */
Warning:    #f59e0b  /* Amber */
Error:      #ef4444  /* Red */
```

**Typography**

Font Family: Inter (Google Fonts)  
Weights: 300, 400, 500, 600, 700

**Spacing Scale**

```
xs: 4px  |  sm: 8px  |  md: 16px  |  lg: 24px  |  xl: 32px
```

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup |
| CSS3 | Styling and animations |
| JavaScript | Interactivity and logic |
| Chart.js | Data visualization |
| Google Fonts | Typography (Inter) |

---

## Responsive Design

| Breakpoint | Layout Adaptation |
|------------|------------------|
| > 1024px | Full sidebar, all features visible |
| 768px - 1024px | Condensed sidebar, optimized spacing |
| < 768px | Bottom navigation, stacked layout |
| < 400px | Maximum compression, minimal UI |

---

## Theme System

The application includes a comprehensive dark mode implementation:

- Automatic system preference detection
- User preference persistence via localStorage
- Smooth color transitions
- Full accessibility compliance

Toggle theme using the icon in the header navigation.

---

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Development

**Local Development**

```bash
# Option 1: Node.js
npx http-server

# Option 2: Python
python -m http.server 8080
```

**Architecture Principles**

- Pure vanilla JavaScript (no frameworks)
- Performance-optimized with minimal dependencies
- Accessibility-first with semantic HTML and ARIA
- Mobile-first responsive approach

---

## Roadmap

**Planned Enhancements**

- Backend API integration
- User authentication system
- Real-time data streaming
- Advanced filtering and search
- Custom date range selection
- Email notification system
- Multi-language support
- Progressive Web App capabilities

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

**Guidelines**

- Maintain existing code style
- Write descriptive commit messages
- Test across multiple browsers
- Update documentation accordingly

---

## Project Information

**Author**: Omansh Choudhary  
**GitHub**: [@omanshchoudhary](https://github.com/omanshchoudhary)  
**Twitter**: [@PhantomC0der](https://twitter.com/PhantomC0der)  
**LinkedIn**: [omanshchoudhary](https://www.linkedin.com/in/omanshchoudhary)

**Stats**

- Lines of Code: ~2,500
- Total Files: 14
- First Frontend Project

---

## Acknowledgments

- Design inspiration from modern SaaS dashboards
- Icons courtesy of [SVG Repo](https://www.svgrepo.com/)
- Color system inspired by Tailwind CSS
- Visualization powered by Chart.js

---

## License

This project is available for personal and educational use. For commercial applications, please contact the author.

---

<div align="center">

**[Back to Top](#visor)**

Built with vanilla JavaScript

</div>