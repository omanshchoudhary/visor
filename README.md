# 📊 Visor

> A modern, responsive analytics dashboard built with vanilla HTML, CSS, and JavaScript

Built without frameworks to showcase clean architecture and performance-first UI engineering.

![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Version](https://img.shields.io/badge/Version-1.0-blue.svg)

**[Live Demo](https://your-vercel-url.vercel.app)** • **[Report Bug](https://github.com/omanshchoudhary/visor/issues)** • **[Request Feature](https://github.com/omanshchoudhary/visor/issues)**

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

### Completed Pages

| Page | Status | Features |
|------|--------|----------|
| **Dashboard** | ✅ Live | Revenue stats, charts, campaign table |
| **Sales** | ✅ Live | Conversion trends, transaction history, CSV export |
| **Users** | ✅ Live | User list, role management, status filtering |
| **Settings** | ✅ Live | Profile management, form validation |
| **Help** | ✅ Live | FAQ section, expandable questions |

---

## Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic web server (optional, for local development)

### Installation

```bash
# Clone
git clone https://github.com/omanshchoudhary/visor.git

# Navigate to directory
cd visor

# Run local server
npx http-server
```

Then visit `http://localhost:8080` in your browser.

---

## Project Structure

```
visor/
│
├── index.html              # Main dashboard
├── sales.html              # Sales analytics & export
├── users.html              # User management
├── settings.html           # User settings & profile
├── help.html               # FAQ & support
│
├── css/
│   ├── index.css          # Base styles
│   ├── header.css         # Header component
│   ├── sidebar.css        # Navigation sidebar
│   ├── content.css        # Main content area
│   ├── theme.css          # Theme variables & dark mode
│   ├── responsive.css     # Media queries
│   ├── help.css           # Help page styles
│   └── settings.css       # Settings page styles
│
├── js/
│   ├── data.js            # Data fetching & processing
│   └── theme.js           # Theme toggle functionality
│
├── data/
│   └── data.json          # Dashboard data (90 days)
│
└── assets/
    └── icons/             # SVG icons
```

---

## Key Features Breakdown

### Dashboard
- **3 Key Metrics**: Total Revenue, Sign-ups, Conversion Rate
- **Revenue Chart**: 90-day performance visualization
- **Product Breakdown**: Doughnut chart with plan distribution
- **Top Campaigns**: Table with ROI and status badges

### Sales Page
- **Conversion Rate Trend**: Line chart visualization
- **Daily Transactions**: Complete transaction history
- **CSV Export**: Download data for external analysis

### Users Page
- **User List**: Name, email, role, status, last active
- **Status Filter**: Filter by Active/Inactive users
- **Role Display**: Admin, Manager, User differentiation

### Settings Page
- **Profile Management**: Name, email, bio editing
- **Form Validation**: Client-side validation
- **Save Functionality**: Persistent settings

### Help Page
- **FAQ Section**: Expandable/collapsible questions
- **Search Integration**: Quick answer lookup
- **Detailed Answers**: Code examples and explanations

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

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Development

### Local Development
```bash
# Start a local server
npx http-server

# Or use Python
python -m http.server 8080
```

### Project Principles
- **No frameworks**: Pure vanilla JavaScript
- **Performance-first**: Minimal dependencies
- **Accessibility**: ARIA labels and semantic HTML
- **Responsive**: Mobile-first approach

---

## Future Enhancements

### Planned Features
- [ ] Backend API integration
- [ ] User authentication
- [ ] Real-time data updates
- [ ] Advanced filtering options
- [ ] Custom date range selection
- [ ] Email notifications
- [ ] Multi-language support

---

## Contributing

Contributions are welcome! Here's how you can help:

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
- Chart.js for data visualization

---

## Project Stats

**Lines of Code:** ~2,500+  
**Development Time:** 2 weeks  
**Files:** 14  
**First Frontend Project:** ✅

---

<div align="center">

**[⬆ back to top](#-visor)**

Made with dedication and vanilla JavaScript 💻

</div>