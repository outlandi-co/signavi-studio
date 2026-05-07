import { useContext } from "react"

import {
  NotificationContext
} from "../context/NotificationContextObject"

export default function useNotifications() {

  return useContext(
    NotificationContext
  )
}