#pragma once
#include <cstddef>
#include <functional>
#include <list>
#include <map>
#include <optional>
#include <unordered_map>
#include "furlong/order.hpp"

namespace furlong {

// Holds resting limit orders. Price priority across levels, time priority within a level.
class OrderBook {
public:
    bool add(const Order& order);   // false if quantity is 0, id is a duplicate, or order is Market
    bool cancel(OrderId id);        // false if id is unknown

    std::optional<Price> best_bid() const;
    std::optional<Price> best_ask() const;
    const Order* best_order(Side side) const;     // front of the best price level, or nullptr
    void fill_front(Side side, Quantity qty);     // reduce/remove the front order of the best level
    Quantity quantity_at(Side side, Price price) const;
    std::size_t order_count() const { return index_.size(); }

private:
    using Level = std::list<Order>;
    struct Locator { Side side; Price price; Level::iterator it; };

    std::map<Price, Level, std::greater<Price>> bids_;
    std::map<Price, Level> asks_;
    std::unordered_map<OrderId, Locator> index_;
};

}  // namespace furlong