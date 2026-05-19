# 🕋 Al-Ye'AnDiMo (Alhamdulillah It's Yet Another Display Mosque)

[Bahasa Indonesia](README.md) | **English**

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-Svelte_5-orange.svg)
[![Demo](https://img.shields.io/badge/demo-live-success.svg)](https://al-yeandimo-demo.vercel.app/)

> **🚀 TRY THE LIVE DEMO HERE:** [al-yeandimo-demo.vercel.app](https://al-yeandimo-demo.vercel.app/)

> **⚠️ DISCLAIMER:** This is NOT "Yet Another Dotfiles Manager". We don't manage your `.bashrc`, we manage your mosque's prayer times so the congregation isn't late. Al-Ye'AnDiMo is an aesthetic, modern, and easy-to-manage mosque information display solution.

**Al-Ye'AnDiMo** is a "vibe-centric" mosque information display system designed specifically for 1080p screens. Built with the latest technology for the benefit of the Ummah.

## ✨ Key Features

- 🕋 **Automatic Prayer Schedule**: Precision calculation based on location coordinates (Lat/Lng).
- ⚡ **Real-time Sync (SSE)**: Changes in the Admin Panel appear instantly on the screen without refreshing.
- 🎨 **Dynamic Themes**: Choose from various themes (Modern, Classic, Ocean, Sunset, etc.) that adapt to the atmosphere.
- 🖼️ **Slideshow Background**: Easily upload photos of mosque activities or landscapes.
- 💰 **Cash Management (BETA)**: Transparent recording of income & expenses (Available to try in the latest build).
- 📜 **Information & Scrolling Text**: Convey announcements or hadiths with an elegant style.
- 🕌 **Friday Mode**: Specialized display for Khatib names and khutbah duration.

## 📸 Display Gallery

<details>
<summary><b>✨ Click to view display gallery (Main Display & Admin Panel)</b></summary>

### 📺 Main Display (TV View)

Elegant and informative main display for the congregation.

|            Main Dashboard             |             Adhan Mode             |
| :-----------------------------------: | :--------------------------------: |
| ![Main Display](img/main-display.png) | ![Azan](img/main-display-azan.png) |
|           _Main Dashboard_            |        _Adhan Notification_        |

|              Iqomah Mode               |              Prayer Mode               |
| :------------------------------------: | :------------------------------------: |
| ![Iqomah](img/main-display-iqomah.png) | ![Shalat](img/main-display-shalat.png) |
|           _Iqomah Countdown_           |      _Prayer Instruction Screen_       |

|             Friday Mode              |               Khutbah Mode               |
| :----------------------------------: | :--------------------------------------: |
| ![Jumat](img/main-display-jumat.png) | ![Khutbah](img/main-display-khutbah.png) |
|        _Khatib & Muazin Info_        |          _Friday Khutbah Timer_          |

### 📱 Admin Panel (Settings)

Manage all display content easily via Mobile or PC.

|            Desktop (Admin)            |            Mobile (Admin)             |
| :-----------------------------------: | :-----------------------------------: |
| ![Admin PC](img/admin-pc-general.png) | ![Admin HP](img/admin-hp-general.jpg) |
|        _Settings via Desktop_         |        _Responsive on Mobile_         |

|       Cash Management        |          Lock Screen           |
| :--------------------------: | :----------------------------: |
| ![Kas](img/admin-pc-kas.png) | ![Lock](img/admin-pc-lock.png) |
|   _Financial Transparency_   |    _Panel Access Security_     |

</details>

## 🛠️ Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (Runes)
- **Meta-framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Communication**: Server-Sent Events (SSE)

## 🚀 Installation & Setup Guide

For mosque administrators who want to install this system, please read the full guide at:

👉 **[INSTALLATION & SETUP GUIDE (MOSQUE_INSTALL.md)](MOSQUE_INSTALL.md)**

## 📦 Download Ready-to-Use Releases

If you don't want to build from source code, you can download the ready-made runner package for Linux or Windows on the **[Releases](https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases)** page.

## 🛠️ Development (For Developers)

1. **Clone Repository**

   ```bash
   git clone https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque.git
   cd Yet-Another-Display-Mosque
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Run Development Mode**

   ```bash
   pnpm dev
   ```

4. **Build Runner Package**
   ```bash
   bash build.sh
   ```

## 📝 License

This project is under the MIT License. Feel free to use and modify for the benefit of the community.

---

Made with ❤️ by [nyanpoketto-kujira](https://github.com/nyanpoketto-kujira)
