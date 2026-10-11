#include "furlong/matching_engine.hpp"
#include <algorithm>

namespace furlong {

std::vector<Trade> MatchingEngine::submit(Order order) {
    std::vector<Trade> trades;
    if (order.quantity == 0) return trades;

    const bool buy = order.side == Side::Buy;
    const Side opposite = buy ? Side::Sell : Side::Buy;

    while (order.quantity > 0) {
        const Order* maker = book_.best_order(opposite);
        if (!maker) break;

        if (order.type == OrderType::Limit) {
            const bool crosses = buy ? maker->price <= order.price : maker->price >= order.price;
            if (!crosses) break;
        }

        const Quantity qty = std::min(order.quantity, maker->quantity);
        trades.push_back(Trade{order.id, maker->id, maker->price, qty});  // record before the pointer is invalidated
        book_.fill_front(opposite, qty);
        order.quantity -= qty;
    }

    if (order.quantity > 0 && order.type == OrderType::Limit) book_.add(order);
    return trades;
}

}  // namespace furlong