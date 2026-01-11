# 📊 Visor

> A modern, responsive analytics dashboard built with vanilla HTML, CSS, and JavaScript

Built without frameworks to showcase clean architecture and performance-first UI engineering.

![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Version](https://img.shields.io/badge/Version-1.0-blue.svg)

---

## Features

### Modern UI/UX
- Clean, professional interface with smooth animations
- Fully responsive design (desktop → tablet → mobile)
- Dark mode support with system preference detection
- Accessible components with ARIA labels

### Data Visualization
- Interactive charts powered by Chart.js
- Real-time revenue tracking
- Conversion rate analytics
- Product breakdown with doughnut charts
- Campaign performance tables

### Current Pages

**Dashboard** — Live  
Other pages — Planned for v2.0

---

## Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic web server (optional, for local development)

### Installation

```bash
# Clone
git clone https://github.com/omanshchoudhary/visor.git

# Run local server
npx http-server
```

---

## Project Structure

```
visor/
│
├── index.html              # Main dashboard
├── users.html              # Users page (coming soon)
├── sales.html              # Sales page (coming soon)
├── settings.html           # Settings page (coming soon)
├── help.html               # Help page (coming soon)
│
├── css/
│   ├── index.css          # Base styles
│   ├── header.css         # Header component
│   ├── sidebar.css        # Navigation sidebar
│   ├── content.css        # Main content area
│   ├── theme.css          # Theme variables & dark mode
│   └── responsive.css     # Media queries
│
├── js/
│   ├── main.js            # Core application logic
│   ├── data.js            # Data fetching & processing
│   ├── charts.js          # Chart configurations
│   ├── filters.js         # Data filtering utilities
│   └── theme.js           # Theme toggle functionality
│
├── data/
│   └── data.json          # Dashboard data
│
├── assets/
│   └── icons/             # SVG icons
│
└── README.md              # You are here!
```

---

## Design System

### Color Palette

```css
Primary:    #6366f1  /* Indigo */
Success:    #10b981  /* Emerald */
Warning:    #f59e0b  /* Amber */
Error:      #ef4444  /* Red */
```

### Typography

**Font Family:** Inter (via Google Fonts)

**Weights:** 300, 400, 500, 600, 700

### Spacing Scale

```
xs: 4px   |  sm: 8px   |  md: 16px  |  lg: 24px  |  xl: 32px
```

---

## Upcoming Features

### Version 2.0 — Planned

#### User Management
- [ ] User list with search & filters
- [ ] User profiles with activity history
- [ ] Role-based access control
- [ ] Bulk user operations

#### Sales Analytics
- [ ] Sales funnel visualization
- [ ] Product performance metrics
- [ ] Revenue forecasting
- [ ] Export reports (PDF/CSV)

#### Settings & Customization
- [ ] Dashboard layout editor
- [ ] Custom color themes
- [ ] Notification preferences
- [ ] Data export settings

### Version 3.0 — Future ideas

#### Advanced Features
- [ ] Real-time data streaming
- [ ] AI-powered insights
- [ ] Custom widget builder
- [ ] Multi-language support
- [ ] API integration tools
- [ ] Collaborative features

#### Performance
- [ ] PWA support (offline mode)
- [ ] Advanced caching
- [ ] Lazy loading
- [ ] Performance monitoring

---

## Technologies

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="48" height="48" alt="HTML5" />
      <br>HTML5
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="48" height="48" alt="CSS3" />
      <br>CSS3
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="48" height="48" alt="JavaScript" />
      <br>JavaScript
    </td>
  </tr>
</table>

**Libraries:**
- [Chart.js](https://www.chartjs.org/) - Beautiful data visualizations
- [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter) - Typography

---

## Responsive Breakpoints

| Device | Breakpoint | Layout Changes |
|--------|-----------|----------------|
| Desktop | > 1024px | Full sidebar, all features visible |
| Tablet | 768px - 1024px | Condensed sidebar, optimized spacing |
| Mobile | < 768px | Bottom navigation, stacked cards |
| Small Mobile | < 400px | Maximum compression, minimal UI |

---

## Theme Support

Visor includes a built-in dark mode that:
- Automatically detects system preferences
- Remembers user selection in localStorage
- Provides smooth transitions between modes
- Maintains accessibility standards

**Toggle dark mode:** Click the theme icon in the header!

---

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Write clear commit messages
- Test on multiple browsers
- Update documentation as needed

---

---

## Author

**Omansh Choudhary**
- GitHub: [@omanshchoudhary](https://github.com/omanshchoudhary)
- Twitter: [@PhantomC0der](https://twitter.com/PhantomC0der)
- LinkedIn: [omanshchoudhary](https://www.linkedin.com/in/omanshchoudhary)

---

## Acknowledgments

- Design inspiration from modern SaaS dashboards
- Icons from [SVG Repo](https://www.svgrepo.com/)
- Color palette inspired by Tailwind CSS
- Community feedback and contributions

---


<div align="center">

**[⬆ back to top](#-visor)**

**[Report Bug](https://github.com/omanshchoudhary/visor/issues)** • **[Request Feature](https://github.com/omanshchoudhary/visor/issues)**

</div>