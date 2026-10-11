#include "furlong/order_book.hpp"

namespace furlong {

namespace {
template <class Map, class Index>
void fill_front_impl(Map& m, Index& idx, Quantity qty) {
    if (m.empty()) return;
    auto level = m.begin();
    Order& front = level->second.front();
    if (qty >= front.quantity) {
        idx.erase(front.id);
        level->second.pop_front();
        if (level->second.empty()) m.erase(level);
    } else {
        front.quantity -= qty;
    }
}
}  // namespace

bool OrderBook::add(const Order& o) {
    if (o.quantity == 0 || o.type != OrderType::Limit || index_.count(o.id)) return false;
    Level& level = (o.side == Side::Buy) ? bids_[o.price] : asks_[o.price];
    level.push_back(o);
    index_[o.id] = Locator{o.side, o.price, std::prev(level.end())};
    return true;
}

bool OrderBook::cancel(OrderId id) {
    auto found = index_.find(id);
    if (found == index_.end()) return false;
    const Locator loc = found->second;
    if (loc.side == Side::Buy) {
        auto lv = bids_.find(loc.price);
        lv->second.erase(loc.it);
        if (lv->second.empty()) bids_.erase(lv);
    } else {
        auto lv = asks_.find(loc.price);
        lv->second.erase(loc.it);
        if (lv->second.empty()) asks_.erase(lv);
    }
    index_.erase(found);
    return true;
}

std::optional<Price> OrderBook::best_bid() const {
    return bids_.empty() ? std::nullopt : std::optional<Price>(bids_.begin()->first);
}

std::optional<Price> OrderBook::best_ask() const {
    return asks_.empty() ? std::nullopt : std::optional<Price>(asks_.begin()->first);
}

const Order* OrderBook::best_order(Side side) const {
    if (side == Side::Buy) return bids_.empty() ? nullptr : &bids_.begin()->second.front();
    return asks_.empty() ? nullptr : &asks_.begin()->second.front();
}

void OrderBook::fill_front(Side side, Quantity qty) {
    if (side == Side::Buy) fill_front_impl(bids_, index_, qty);
    else fill_front_impl(asks_, index_, qty);
}

Quantity OrderBook::quantity_at(Side side, Price price) const {
    Quantity total = 0;
    auto sum = [&](const Level& level) { for (const Order& o : level) total += o.quantity; };
    if (side == Side::Buy) { auto it = bids_.find(price); if (it != bids_.end()) sum(it->second); }
    else { auto it = asks_.find(price); if (it != asks_.end()) sum(it->second); }
    return total;
}

}  // namespace furlong