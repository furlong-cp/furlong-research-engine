#pragma once
#include <vector>
#include "furlong/order.hpp"
#include "furlong/order_book.hpp"

namespace furlong {

class MatchingEngine {
public:
    // Matches against the book. A limit order's unfilled remainder rests;
    // a market order's unfilled remainder is discarded.
    std::vector<Trade> submit(Order order);
    bool cancel(OrderId id) { return book_.cancel(id); }
    const OrderBook& book() const { return book_; }

private:
    OrderBook book_;
};

}  // namespace furlong