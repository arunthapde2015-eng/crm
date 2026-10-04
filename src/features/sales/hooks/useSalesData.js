import { useReducer } from 'react';

import { getSalesData } from '../api/salesData';
import { updateSalesperson } from '../utils/team';

const ACTIONS = {
  ADD_ORDER: 'add-order',
  SET_ORDER_STATUS: 'set-order-status',
  ADD_PAYMENT: 'add-payment',
  ADD_MEMBER: 'add-member',
  UPDATE_MEMBER: 'update-member',
  SET_MEMBER_STATUS: 'set-member-status',
  SET_TARGET: 'set-target',
};

function updateById(items, id, update) {
  return items.map((item) => (item.id === id ? update(item) : item));
}

function salesReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_ORDER:
      return { ...state, orders: [...state.orders, action.order] };
    case ACTIONS.SET_ORDER_STATUS:
      return {
        ...state,
        orders: updateById(state.orders, action.orderId, (order) => ({
          ...order,
          status: action.status,
        })),
      };
    case ACTIONS.ADD_PAYMENT:
      return {
        ...state,
        orders: updateById(state.orders, action.orderId, (order) => ({
          ...order,
          payments: [...order.payments, action.payment],
        })),
      };
    case ACTIONS.ADD_MEMBER:
      return { ...state, team: [...state.team, action.member] };
    case ACTIONS.UPDATE_MEMBER:
      return {
        ...state,
        team: updateById(state.team, action.memberId, (member) =>
          updateSalesperson(member, action.values),
        ),
      };
    case ACTIONS.SET_MEMBER_STATUS:
      return {
        ...state,
        team: updateById(state.team, action.memberId, (member) => ({
          ...member,
          status: action.status,
        })),
      };
    case ACTIONS.SET_TARGET:
      return {
        ...state,
        team: updateById(state.team, action.memberId, (member) => ({
          ...member,
          monthlyTarget: action.target,
        })),
      };
    default:
      throw new Error(`Unknown sales action: ${action.type}`);
  }
}

// In-memory sales data until the sales API exists; changes reset on reload.
export function useSalesData(initialData) {
  const [data, dispatch] = useReducer(salesReducer, initialData, (seed) => seed ?? getSalesData());

  return {
    data,
    addOrder: (order) => dispatch({ type: ACTIONS.ADD_ORDER, order }),
    setOrderStatus: (orderId, status) =>
      dispatch({ type: ACTIONS.SET_ORDER_STATUS, orderId, status }),
    addPayment: (orderId, payment) => dispatch({ type: ACTIONS.ADD_PAYMENT, orderId, payment }),
    addMember: (member) => dispatch({ type: ACTIONS.ADD_MEMBER, member }),
    updateMember: (memberId, values) => dispatch({ type: ACTIONS.UPDATE_MEMBER, memberId, values }),
    setMemberStatus: (memberId, status) =>
      dispatch({ type: ACTIONS.SET_MEMBER_STATUS, memberId, status }),
    setTarget: (memberId, target) => dispatch({ type: ACTIONS.SET_TARGET, memberId, target }),
  };
}
