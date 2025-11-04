# ClimaSphere: Global Climate Event Tracker

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/asiakay/climasphere-global-climate-event-tracker)

ClimaSphere is a visually stunning, minimalist web application designed to track global climate events in real-time. The application fetches data from a specified API, presenting it in a clean, elegant, and highly readable card-based interface. It prioritizes user experience with a responsive, mobile-first design, seamless state transitions, and clear feedback for loading, error, and empty data scenarios.

The core of the application is a single, information-dense view that includes a sophisticated header, a control bar with refresh functionality, and a dynamic grid of event cards. Each component is meticulously crafted using shadcn/ui and styled with Tailwind CSS to achieve a polished, professional aesthetic.

## Key Features

-   **Real-Time Data:** Fetches and displays the latest global climate events.
-   **Elegant UI:** A clean, minimalist, and visually appealing card-based interface.
-   **Fully Responsive:** Flawless user experience on all devices, from mobile phones to desktops.
-   **Robust State Management:** Graceful handling of loading, error, and empty data states to keep the user informed.
-   **Interactive Controls:** Simple controls for refreshing data on-demand.
-   **High-Performance:** Built with modern tools for a fast and smooth user experience.

## Technology Stack

-   **Framework:** React (Vite)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui
-   **State Management:** Zustand
-   **Icons:** Lucide React
-   **Animations:** Framer Motion
-   **Deployment:** Cloudflare Workers

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Bun](https://bun.sh/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd climasphere-event-tracker
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

## Development

To run the development server, execute the following command. This will start the application on `http://localhost:3000`.

```bash
bun dev
```

The application will automatically reload if you change any of the source files.

## Deployment

This application is designed for easy deployment to Cloudflare's global network.

1.  **Build the project:**
    This command bundles the application for production.
    ```bash
    bun build
    ```

2.  **Deploy to Cloudflare:**
    Run the deploy script to publish your application. You will need to be logged into your Cloudflare account via the Wrangler CLI.
    ```bash
    bun deploy
    ```

Alternatively, you can deploy your own version of this project with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/asiakay/climasphere-global-climate-event-tracker)