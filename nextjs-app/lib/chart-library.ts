import { Chart, BarController, BarElement, LineController, LineElement, PointElement,
  CategoryScale, LinearScale, Legend, Tooltip, Filler } from 'chart.js'

Chart.register(BarController, BarElement, LineController, LineElement, PointElement,
  CategoryScale, LinearScale, Legend, Tooltip, Filler)
export { Chart }
