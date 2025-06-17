# AIoT Application with Next.js, FastAPI, and ESP32-S3

This project is an AIoT application built with **Next.js**, **FastAPI**, and the **ESP32-S3**. It provides a web service that allows you to control your devices, perform Over-the-Air (OTA) updates, and deploy or switch AI models. Currently, it only supports **Object Detection** models.

## ✨ Features

* **Remote Device Control**: Manage and interact with your ESP32-S3 devices directly from the web interface.
* **OTA Updates**: Seamlessly update the firmware of your devices over the air.
* **AI Model Management**: Deploy and switch between different object detection models on your devices.

## 🗃️ Architecture

The core of this project relies on the **WebSocket** protocol to establish real-time communication between the frontend (web interface), the backend (server), and the device (ESP32-S3). A task management system is implemented to synchronize the state between the backend and the device, ensuring reliable command execution and status updates.

## Project Status: Version 1 (v1)

This is the first version (v1) of the project. As it is developed and maintained by a single student, there might be some bugs. Please be patient, as bug fixes may be slower than in commercially developed software. Your understanding and contributions are highly appreciated!

### Future Plans: Version 2 (v2)

The next major release will focus on enhancing the project's robustness, security, and functionality. Here are the planned features for v2:

* **MQTT for Task Publishing**: Transition the task publishing protocol from WebSocket to MQTT for more reliable and scalable messaging.
* **QR Code Provisioning**: Add a feature to configure device Wi-Fi credentials by scanning a QR code, simplifying the setup process.
* **TLS Encryption**: Implement Transport Layer Security (TLS) to secure the communication channels between all components.
* **Image Classification Support**: Extend AI model support to include image classification models.

&nbsp;
&nbsp;

## 🛠️ Quick Start

1. Clone the repository:
   git clone https://github.com/boxain/aiot_web.git
   cd your-project

2. Create your environment files:
   - copy backend/.env.example file to backend/.env
   - copy frontend/.env.example file to frontend/.env.local

3. Modify the values in `.env` and `.env.local` to suit your needs.

4. Build and run the application:
   docker compose up --build -d