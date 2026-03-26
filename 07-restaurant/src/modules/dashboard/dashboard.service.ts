import { AppDataSource } from '../../config/database.config';

export class DashboardService {
  async getStats() {
    const today = new Date().toISOString().split('T')[0];

    const [todayOrders] = await AppDataSource.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE DATE(created_at) = $1 AND status != 'cancelled'`,
      [today],
    );

    const popularItems = await AppDataSource.query(`
      SELECT mi.name, mi.id, SUM(oi.quantity) as total_ordered, mi.price
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled'
      GROUP BY mi.id, mi.name, mi.price
      ORDER BY total_ordered DESC
      LIMIT 5
    `);

    const tableOccupancy = await AppDataSource.query(`
      SELECT status, COUNT(*) as count FROM tables WHERE is_active = true GROUP BY status
    `);

    const recentOrders = await AppDataSource.query(`
      SELECT id, order_number, type, status, total, created_at FROM orders ORDER BY created_at DESC LIMIT 5
    `);

    const totalRevenue = await AppDataSource.query(
      `SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'`,
    );

    const pendingReservations = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM reservations WHERE status IN ('pending','confirmed') AND reservation_date >= CURRENT_DATE`,
    );

    return {
      today: {
        ordersCount: parseInt(todayOrders.count),
        revenue: parseFloat(todayOrders.revenue),
      },
      totalRevenue: parseFloat(totalRevenue[0].revenue),
      popularItems,
      tableOccupancy,
      recentOrders,
      pendingReservations: parseInt(pendingReservations[0].count),
    };
  }
}
