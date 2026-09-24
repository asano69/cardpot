package realtime

// Hub owns the centrifuge node and publishes card changes to per-pot channels.
type Hub struct {
	node    *centrifuge.Node
	publish func(channel string, data []byte) error // replaceable in tests
}

func CardsChannel(potID string) string { return "cards:" + potID }

func New(app core.App) (*Hub, error) {
	node, err := centrifuge.New(centrifuge.Config{})
	if err != nil {
		return nil, err
	}

	node.OnConnecting(func(_ context.Context, e centrifuge.ConnectEvent) (centrifuge.ConnectReply, error) {
		rec, err := app.FindAuthRecordByToken(e.Token, core.TokenTypeAuth)
		if err != nil || !rec.IsSuperuser() {
			return centrifuge.ConnectReply{}, centrifuge.DisconnectInvalidToken
		}
		return centrifuge.ConnectReply{Credentials: &centrifuge.Credentials{UserID: rec.Id}}, nil
	})

	node.OnConnect(func(client *centrifuge.Client) {
		client.OnSubscribe(func(e centrifuge.SubscribeEvent, cb centrifuge.SubscribeCallback) {
			if !strings.HasPrefix(e.Channel, "cards:") {
				cb(centrifuge.SubscribeReply{}, centrifuge.ErrorPermissionDenied)
				return
			}
			cb(centrifuge.SubscribeReply{
				Options: centrifuge.SubscribeOptions{EnableRecovery: true},
			}, nil)
		})
	})

	h := &Hub{node: node}
	h.publish = func(ch string, data []byte) error {
		_, err := node.Publish(ch, data, centrifuge.WithHistory(1000, 10*time.Minute))
		return err
	}
	return h, node.Run()
}
