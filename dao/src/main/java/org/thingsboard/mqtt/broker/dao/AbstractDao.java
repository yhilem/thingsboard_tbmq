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
package org.thingsboard.mqtt.broker.dao;

import com.google.common.collect.Lists;
import com.google.common.util.concurrent.ListenableFuture;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;
import org.thingsboard.mqtt.broker.dao.model.BaseEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
public abstract class AbstractDao<E extends BaseEntity<D>, D>
        extends JpaAbstractDaoListeningExecutorService
        implements Dao<D> {

    protected abstract Class<E> getEntityClass();

    protected abstract CrudRepository<E, UUID> getCrudRepository();

    @Override
    @Transactional
    public D save(D domain) {
        E entity;
        try {
            entity = getEntityClass().getConstructor(domain.getClass()).newInstance(domain);
        } catch (Exception e) {
            log.error("Can't create entity for domain object {}", domain, e);
            throw new IllegalArgumentException("Can't create entity for domain object {" + domain + "}", e);
        }
        if (log.isDebugEnabled()) {
            log.debug("Saving entity {}", entity);
        }
        if (entity.getId() == null) {
            UUID uuid = UUID.randomUUID();
            entity.setId(uuid);
            entity.setCreatedTime(System.currentTimeMillis());
        }
        entity = getCrudRepository().save(entity);
        return DaoUtil.getData(entity);
    }

    @Override
    public D findById(UUID key) {
        if (log.isDebugEnabled()) {
            log.debug("Get entity by key {}", key);
        }
        Optional<E> entity = getCrudRepository().findById(key);
        return DaoUtil.getData(entity);
    }

    @Override
    public ListenableFuture<D> findByIdAsync(UUID key) {
        if (log.isDebugEnabled()) {
            log.debug("Get entity by key async {}", key);
        }
        return service.submit(() -> DaoUtil.getData(getCrudRepository().findById(key)));
    }

    @Override
    @Transactional
    public boolean removeById(UUID id) {
        getCrudRepository().deleteById(id);
        if (log.isDebugEnabled()) {
            log.debug("Remove request: {}", id);
        }
        return !getCrudRepository().existsById(id);
    }

    @Override
    public List<D> find() {
        List<E> entities = Lists.newArrayList(getCrudRepository().findAll());
        return DaoUtil.convertDataList(entities);
    }
}
