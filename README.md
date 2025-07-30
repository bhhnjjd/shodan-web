# Shodan Network Mapper

A comprehensive network mapping and vulnerability analysis tool powered by the Shodan API.

## Features

- 🔍 **Advanced Host Discovery**: Detailed IP and domain reconnaissance
- 🛡️ **Vulnerability Analysis**: CVE detection and security assessment
- 📊 **Data Visualization**: Interactive charts and network graphs
- 🔔 **Real-time Monitoring**: Network alerts and continuous scanning
- 📈 **Reporting**: Export findings in multiple formats
- 🌐 **Global Coverage**: Access to Shodan's worldwide internet data

## Quick Start

1. Get your Shodan API key from [developer.shodan.io](https://developer.shodan.io)
2. Install dependencies: `npm run install-all`
3. Configure environment: Copy `.env.example` to `.env` and add your API key
4. Start development: `npm run dev`

## API Endpoints

- `/api/host/:ip` - Get detailed host information
- `/api/search` - Search Shodan database
- `/api/vulnerabilities/:ip` - Analyze host vulnerabilities
- `/api/alerts` - Manage network monitoring alerts
- `/api/dns/:domain` - DNS reconnaissance

## Security Notice

This tool is designed for defensive security research and authorized network analysis only. Users are responsible for compliance with applicable laws and regulations.