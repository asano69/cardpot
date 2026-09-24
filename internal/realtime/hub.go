package realtime

import (
	"context"
	"time"

	"github.com/centrifugal/centrifuge"
	"github.com/pocketbase/pocketbase/core"
)

const (
	// CardsChannel carries every card event of every pot. The app is small
	// enough that each client simply receives all of them, and the frontend
	// store ignores cards it does not hold.
	CardsChannel = "cards"

	// historySize and historyTTL bound how much a channel remembers for
	// recovery after a short disconnect. Tune these from real usage.
	historySize = 1000
	historyTTL  = 10 * time.Minute
)

// Hub owns the centrifuge node and publishes card changes to the cards channel.
type Hub struct {
	node    *centrifuge.Node
	publish func(channel string, data []byte) error // replaceable in tests
}

// New creates and starts the hub. Only superusers may connect (see
// authenticate), and they may only subscribe to the cards channel; clients can
// never publish, because no OnPublish handler is set.
func New(app core.App) (*Hub, error) {
	node, err := centrifuge.New(centrifuge.Config{})
	if err != nil {
		return nil, err
	}

	node.OnConnecting(func(_ context.Context, e centrifuge.ConnectEvent) (centrifuge.ConnectReply, error) {
		userID, err := authenticate(app, e.Token)
		if err != nil {
			return centrifuge.ConnectReply{}, centrifuge.DisconnectInvalidToken
		}
		return centrifuge.ConnectReply{Credentials: &centrifuge.Credentials{UserID: userID}}, nil
	})

	node.OnConnect(func(client *centrifuge.Client) {
		client.OnSubscribe(func(e centrifuge.SubscribeEvent, cb centrifuge.SubscribeCallback) {
			if e.Channel != CardsChannel {
				cb(centrifuge.SubscribeReply{}, centrifuge.ErrorPermissionDenied)
				return
			}
			cb(centrifuge.SubscribeReply{
				Options: centrifuge.SubscribeOptions{EnableRecovery: true},
			}, nil)
		})
	})

	hub := &Hub{node: node}
	hub.publish = func(channel string, data []byte) error {
		_, err := node.Publish(channel, data, centrifuge.WithHistory(historySize, historyTTL))
		return err
	}

	if err := node.Run(); err != nil {
		return nil, err
	}
	return hub, nil
}
