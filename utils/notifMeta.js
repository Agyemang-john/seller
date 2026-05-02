// utils/notifMeta.js
// Maps notification verbs to Material UI icons + colors.
// Import getNotifMeta() wherever you render a notification.

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PinDropIcon from '@mui/icons-material/PinDrop';
import SellIcon from '@mui/icons-material/Sell';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RateReviewIcon from '@mui/icons-material/RateReview';
import MessageIcon from '@mui/icons-material/Message';
import CampaignIcon from '@mui/icons-material/Campaign';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import NotificationsIcon from '@mui/icons-material/Notifications';

const VERB_MAP = {
  // Vendor
  vendor_new_order:           { Icon: ShoppingBagIcon,           color: '#1565C0', label: 'New Order'            },
  vendor_order_shipped:       { Icon: LocalShippingIcon,         color: '#6A1B9A', label: 'Order Shipped'         },
  vendor_order_cancelled:     { Icon: CancelIcon,                color: '#C62828', label: 'Order Cancelled'       },
  vendor_payout:              { Icon: PaymentsIcon,              color: '#2E7D32', label: 'Payout'                },
  vendor_low_stock:           { Icon: InventoryIcon,             color: '#E65100', label: 'Low Stock'             },
  vendor_new_review:          { Icon: StarIcon,                  color: '#F9A825', label: 'New Review'            },
  vendor_product_approved:    { Icon: CheckCircleIcon,           color: '#2E7D32', label: 'Product Approved'      },
  vendor_product_rejected:    { Icon: CancelIcon,                color: '#C62828', label: 'Product Rejected'      },
  vendor_withdrawal_request:  { Icon: AccountBalanceIcon,        color: '#1565C0', label: 'Withdrawal Requested'  },
  vendor_withdrawal_approved: { Icon: AccountBalanceWalletIcon,  color: '#2E7D32', label: 'Withdrawal Approved'   },
  // Customer
  customer_order_placed:      { Icon: ReceiptLongIcon,           color: '#1565C0', label: 'Order Placed'          },
  customer_order_confirmed:   { Icon: CheckCircleIcon,           color: '#2E7D32', label: 'Order Confirmed'       },
  customer_order_shipped:     { Icon: LocalShippingIcon,         color: '#6A1B9A', label: 'Order Shipped'         },
  customer_order_delivered:   { Icon: CelebrationIcon,           color: '#2E7D32', label: 'Order Delivered'       },
  customer_order_cancelled:   { Icon: CancelIcon,                color: '#C62828', label: 'Order Cancelled'       },
  customer_refund_processed:  { Icon: PaymentsIcon,              color: '#2E7D32', label: 'Refund Processed'      },
  customer_tracking_update:   { Icon: PinDropIcon,               color: '#E65100', label: 'Tracking Update'       },
  customer_price_drop:        { Icon: SellIcon,                  color: '#00695C', label: 'Price Drop'            },
  customer_back_in_stock:     { Icon: Inventory2Icon,            color: '#1565C0', label: 'Back in Stock'         },
  customer_wishlist_sale:     { Icon: FavoriteIcon,              color: '#AD1457', label: 'Wishlist Sale'         },
  customer_review_reminder:   { Icon: RateReviewIcon,            color: '#F9A825', label: 'Rate Purchase'         },
  // Shared
  message:                    { Icon: MessageIcon,               color: '#1565C0', label: 'Message'               },
  announcement:               { Icon: CampaignIcon,              color: '#6A1B9A', label: 'Announcement'          },
  support_reply:              { Icon: SupportAgentIcon,          color: '#00695C', label: 'Support Reply'         },
  verification_update:        { Icon: VerifiedUserIcon,          color: '#2E7D32', label: 'Verification'          },
  subscription_reminder:      { Icon: SubscriptionsIcon,         color: '#E65100', label: 'Subscription'          },
};

const FALLBACK = { Icon: NotificationsIcon, color: '#424242', label: 'Notification' };

/**
 * Returns { Icon, color, label } for a given verb.
 * data.color can override the default color if the backend sets one.
 */
export function getNotifMeta(verb, data) {
  const base = VERB_MAP[verb] || FALLBACK;
  return {
    ...base,
    color: data?.color || base.color,
    label: data?.title || base.label,
  };
}
