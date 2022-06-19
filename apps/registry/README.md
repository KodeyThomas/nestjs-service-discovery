# Registry

This Service is the main service responsible for Service Discovery. Within the network, it is the only fixed point.

All services connect to the registry to be registered. Once registered, a two-way healthcheck (Heartbeat Mechanism) is used to ensure that the services are healthy.

Once the Heartbeat is performed, the service is marked as `HEALTHY` and Microservices can communicate with it.


> What happens if the registry is down?

All services store a local copy of the registry for eventual consistency. For whatever reason, the registry is down. We can use our local copy of the network to contact services.

> What happens when the registry is back up?

All services who want to be registered will contact the registry and the Heartbeat will be performed again.
