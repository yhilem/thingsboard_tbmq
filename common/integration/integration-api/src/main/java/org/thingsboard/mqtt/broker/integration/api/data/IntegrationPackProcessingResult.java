/**
 * Copyright © 2016-2025 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.thingsboard.mqtt.broker.integration.api.data;

import lombok.Getter;
import org.thingsboard.mqtt.broker.gen.integration.PublishIntegrationMsgProto;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class IntegrationPackProcessingResult {

    @Getter
    private final Map<UUID, PublishIntegrationMsgProto> pendingMap;
    @Getter
    private final Map<UUID, PublishIntegrationMsgProto> failedMap;

    public IntegrationPackProcessingResult(IntegrationPackProcessingContext ctx) {
        this.pendingMap = new HashMap<>(ctx.getPendingMap());
        this.failedMap = new HashMap<>(ctx.getFailedMap());
    }
}
