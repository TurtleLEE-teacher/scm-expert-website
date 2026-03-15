/**
 * Programs Module - 다중 프로그램 지원을 위한 JS 모듈
 * index.html: 카테고리 탭 + 카드 그리드 렌더링
 * program.html: 프로그램 상세 페이지 동적 렌더링
 */

(function() {
    'use strict';

    let programsData = null;

    async function fetchPrograms() {
        if (programsData) return programsData;
        const response = await fetch('./data/programs.json?t=' + Date.now());
        if (!response.ok) throw new Error('프로그램 데이터 로드 실패');
        programsData = await response.json();
        return programsData;
    }

    // ===== INDEX PAGE: 카테고리 탭 + 카드 그리드 =====

    function renderCategoryTabs(categories, container) {
        const tabsHtml = `
            <div class="category-tabs">
                <button class="category-tab active" data-category="all">전체</button>
                ${categories.map(cat => `<button class="category-tab" data-category="${cat.id}">${cat.name}</button>`).join('')}
            </div>
        `;
        container.insertAdjacentHTML('afterbegin', tabsHtml);

        container.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                filterCards(tab.dataset.category, container);
            });
        });
    }

    function filterCards(category, container) {
        const cards = container.querySelectorAll('.service-card');
        cards.forEach(card => {
            const match = category === 'all' || card.dataset.category === category;
            card.style.display = match ? '' : 'none';
            if (match) {
                card.classList.remove('visible');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => card.classList.add('visible'));
                });
            }
        });
    }

    function renderProgramCard(program) {
        const statusClass = program.status === 'active' ? 'recommended' : 'coming-soon';
        const badgeClass = program.status !== 'active' ? 'badge-muted' : '';
        const badgeText = program.status === 'active'
            ? program.badge
            : `${program.badge} · 준비 중`;

        const priceStyle = program.status !== 'active' ? ' style="color: var(--text-tertiary);"' : '';

        const featuresHtml = program.features
            ? program.features.map(f => `<li>${f}</li>`).join('')
            : '';

        let ctaHtml;
        if (program.status === 'active') {
            ctaHtml = `<a href="program.html?id=${program.id}" class="btn btn-primary" style="width: 100%;">자세히 보기</a>`;
        } else {
            ctaHtml = `<span class="btn btn-secondary" style="width: 100%; text-align: center; opacity: 0.5;">준비 중</span>`;
        }

        return `
            <div class="service-card ${statusClass} fade-up visible" data-category="${program.category}" data-status="${program.status}">
                <span class="service-card-badge ${badgeClass}">${badgeText}</span>
                <div class="service-price"${priceStyle}>${program.price}</div>
                <p class="service-price-note">${program.priceNote}</p>
                <ul>${featuresHtml}</ul>
                ${ctaHtml}
            </div>
        `;
    }

    function renderServiceGrid(programs, container) {
        const grid = container.querySelector('.service-grid');
        if (!grid) return;

        const allPrograms = [...programs].sort((a, b) => (a.level || 99) - (b.level || 99));
        const activePrograms = allPrograms.filter(p => p.status === 'active');
        const comingSoonPrograms = allPrograms.filter(p => p.status !== 'active');

        // 통합 학습 로드맵: active는 STEP 1 featured, coming-soon은 compact
        const activeItems = activePrograms.map(p => {
            const stepLabel = `STEP ${p.level || 1}`;
            const featuresHtml = p.features
                ? p.features.slice(0, 4).map(f => `<li>${f}</li>`).join('')
                : '';
            return `
                <div class="roadmap-item roadmap-item--active fade-up">
                    <div class="roadmap-step roadmap-step--active">${stepLabel}</div>
                    <div class="roadmap-content">
                        <h4>${p.shortTitle || p.title}</h4>
                        <p>${p.description}</p>
                        <ul class="roadmap-features">${featuresHtml}</ul>
                    </div>
                    <div class="roadmap-action">
                        <span class="roadmap-price">${p.price}</span>
                        <a href="program.html?id=${p.id}" class="btn btn-primary btn-sm">자세히 보기</a>
                    </div>
                </div>
            `;
        }).join('');

        const comingSoonItems = comingSoonPrograms.map(p => {
            const stepLabel = `STEP ${p.level || '?'}`;
            return `
                <div class="roadmap-item fade-up">
                    <div class="roadmap-step">${stepLabel}</div>
                    <div class="roadmap-content">
                        <h4>${p.shortTitle || p.title}</h4>
                        <p>${p.description}</p>
                    </div>
                    <span class="roadmap-badge">준비 중</span>
                </div>
            `;
        }).join('');

        grid.innerHTML = `
            <div class="roadmap-section fade-up">
                <div class="roadmap-header">
                    <h3>SCM 학습 로드맵</h3>
                    <p>단계별로 설계된 커리큘럼을 따라 SCM 전문가로 성장하세요</p>
                </div>
                <div class="roadmap-list">
                    ${activeItems}
                    ${comingSoonItems}
                </div>
            </div>
        `;
    }

    async function initIndexPage() {
        const servicesSection = document.getElementById('services');
        if (!servicesSection) return;

        try {
            const data = await fetchPrograms();

            // visibility가 unlisted인 프로그램 제외 (미설정 시 listed로 간주)
            const listedPrograms = data.programs.filter(p => p.visibility !== 'unlisted');
            const visibleCategories = data.categories.filter(cat =>
                listedPrograms.some(p => p.category === cat.id)
            );

            // 카테고리가 2개 이상일 때만 탭 렌더링
            if (visibleCategories.length > 1) {
                renderCategoryTabs(visibleCategories, servicesSection);
            }
            renderServiceGrid(listedPrograms, servicesSection);
        } catch (error) {
            console.error('프로그램 로드 실패:', error);
        }
    }

    // ===== PROGRAM DETAIL PAGE =====

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderProgramHero(program) {
        return `
            <section class="hero">
                <div class="hero-badge fade-up">
                    <span class="hero-badge-dot"></span>
                    ${program.targetBadge || program.badge}
                </div>
                <h1 class="hero-title fade-up">${program.title}</h1>
                <p class="hero-subtitle fade-up">${program.description}</p>
                <button class="btn btn-primary btn-lg fade-up" onclick="openDemandModal()">대기 등록하기</button>
                ${program.stats ? `
                <div class="hero-stats fade-up">
                    ${program.stats.map(s => `
                        <div class="hero-stat">
                            <span class="hero-stat-number">${s.number}</span>
                            <span class="hero-stat-label">${s.label}</span>
                        </div>
                    `).join('')}
                </div>` : ''}
            </section>
        `;
    }

    function renderPainPoints(program) {
        if (!program.painPoints || program.painPoints.length === 0) return '';
        return `
            <section class="section">
                <div class="section-header fade-up">
                    <h2>이런 고민, 하고 계신가요?</h2>
                </div>
                <div class="painpoints">
                    <div class="painpoints-grid">
                        ${program.painPoints.map(pp => `
                            <div class="painpoint-card fade-up">
                                <p class="painpoint-q">"${pp.question}"</p>
                                <p class="painpoint-desc">${pp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ${program.painPointAnswer ? `
                    <div class="painpoints-answer fade-up">
                        <p>${program.painPointAnswer}</p>
                    </div>` : ''}
                </div>
            </section>
        `;
    }

    function renderCurriculumWeek(week) {
        const weekNum = week.week === '+' ? '+' : week.week;
        const weekNumClass = week.type === 'bonus' ? ' bonus' : '';
        const sessionBadgeClass = week.type === 'live' ? 'live' : (week.type === 'feedback' ? 'async' : 'consulting');

        let detailsHtml = '';
        if (week.details) {
            detailsHtml = week.details.map(detail => {
                const blockClass = detail.type === 'feedback' ? 'feedback' : (detail.type === 'bonus' ? 'bonus-block' : 'assignment');
                let contentHtml;
                if (detail.items) {
                    contentHtml = `<ul>${detail.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
                    if (detail.deliverable) {
                        contentHtml += `<span class="deliverable">${detail.deliverable}</span>`;
                    }
                } else if (detail.content) {
                    contentHtml = detail.content;
                } else {
                    contentHtml = '';
                }
                return `
                    <div class="detail-block ${blockClass}">
                        <div class="detail-label">${detail.label}</div>
                        <div class="detail-content">${contentHtml}</div>
                    </div>
                `;
            }).join('');
        }

        return `
            <div class="week-card fade-up">
                <div class="week-marker">
                    <div class="week-number${weekNumClass}">${weekNum}</div>
                    <span class="week-label">${week.label}</span>
                </div>
                <div class="week-body">
                    <div class="week-header">
                        <span class="week-title">${week.title}</span>
                        <span class="session-badge ${sessionBadgeClass}"><span class="session-badge-dot"></span>${week.sessionType}</span>
                    </div>
                    <p class="week-desc">${week.description}</p>
                    ${detailsHtml ? `<div class="week-details">${detailsHtml}</div>` : ''}
                </div>
            </div>
        `;
    }

    function renderCurriculum(program) {
        if (!program.curriculum || program.curriculum.length === 0) return '';

        const headerText = program.curriculum.length <= 6
            ? `${program.curriculum.filter(w => w.week !== '+').length}주 커리큘럼`
            : '커리큘럼';
        const bonusWeek = program.curriculum.find(w => w.type === 'bonus');
        if (bonusWeek) {
            // Adjust header to include bonus info
        }

        return `
            <section class="section section-alt">
                <div class="section-header fade-up">
                    <h2>${headerText}</h2>
                </div>
                ${program.images?.curriculum ? `
                <figure class="section-image fade-up">
                    <img src="${program.images.curriculum}" alt="${program.images.curriculumCaption || ''}" loading="lazy">
                    ${program.images.curriculumCaption ? `<figcaption>${program.images.curriculumCaption}</figcaption>` : ''}
                </figure>` : ''}
                <div class="curriculum-grid">
                    ${program.curriculum.map(w => renderCurriculumWeek(w)).join('')}
                </div>
            </section>
        `;
    }

    function renderHowItWorks(program) {
        if (!program.howItWorks || program.howItWorks.length === 0) return '';
        return `
            <section class="section">
                <div class="section-header fade-up">
                    <h2>이렇게 진행됩니다</h2>
                    <p>온라인 소수정예로 밀착 관리합니다</p>
                </div>
                ${program.images?.howItWorks ? `
                <figure class="section-image fade-up">
                    <img src="${program.images.howItWorks}" alt="${program.images.howItWorksCaption || ''}" loading="lazy">
                    ${program.images.howItWorksCaption ? `<figcaption>${program.images.howItWorksCaption}</figcaption>` : ''}
                </figure>` : ''}
                <div class="process-grid">
                    ${program.howItWorks.map(item => `
                        <div class="process-card fade-up">
                            <div class="process-icon">${item.icon}</div>
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderTargetAudience(program) {
        if (!program.targetAudience || program.targetAudience.length === 0) return '';
        return `
            <section class="section section-alt">
                <div class="section-header fade-up">
                    <h2>이런 분께 맞습니다</h2>
                </div>
                <ul class="target-list fade-up">
                    ${program.targetAudience.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </section>
        `;
    }

    function renderOutcomes(program) {
        if (!program.outcomes || program.outcomes.length === 0) return '';
        return `
            <section class="section">
                <div class="section-header fade-up">
                    <h2>수료 후, 이렇게 달라집니다</h2>
                    <p>수료생이 가져가는 구체적인 성과</p>
                </div>
                <div class="outcome-grid">
                    ${program.outcomes.map(o => `
                        <div class="outcome-card fade-up">
                            <h3>${o.title}</h3>
                            <p>${o.description}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderPricing(program) {
        if (!program.pricing) return '';
        const p = program.pricing;
        return `
            <section class="section section-alt" id="pricing">
                <div class="section-header fade-up">
                    <h2>수강 대기 등록</h2>
                    <p>정원이 충족되면 개강 일정을 확정하여 안내드립니다</p>
                </div>
                <div class="price-card fade-up">
                    <div class="price-info-row">
                        <div class="price-info-item">
                            <span class="price-info-label">구성</span>
                            <span class="price-info-value">${p.composition}</span>
                        </div>
                        <div class="price-info-item">
                            <span class="price-info-label">기간</span>
                            <span class="price-info-value">${p.duration}</span>
                        </div>
                        <div class="price-info-item">
                            <span class="price-info-label">정원</span>
                            <span class="price-info-value">${p.capacity}</span>
                        </div>
                    </div>
                    <div class="price-amount">${p.amount}</div>
                    <p class="price-desc">${p.subtitle}</p>
                    <div class="price-features">
                        <ul>
                            ${p.includes.map(i => `<li><span>&#10003;</span> ${i}</li>`).join('')}
                        </ul>
                    </div>
                    <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="openDemandModal()">대기 등록하기</button>
                    <div class="refund-policy">
                        <strong>환불 규정</strong>
                        ${p.refundPolicy}
                    </div>
                </div>
            </section>
        `;
    }

    function renderFaqs(program) {
        if (!program.faqs || program.faqs.length === 0) return '';
        return `
            <section class="section">
                <div class="section-header fade-up">
                    <h2>자주 묻는 질문</h2>
                </div>
                <div class="faq-container">
                    <div class="faq-list">
                        ${program.faqs.map(faq => `
                            <div class="faq-item fade-up">
                                <button class="faq-question" onclick="toggleFaq(this)">
                                    ${escapeHtml(faq.question)}
                                    <span class="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
                                </button>
                                <div class="faq-answer">
                                    <div class="faq-answer-content">${faq.answer}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    function renderCta(program) {
        if (!program.ctaText) return '';
        return `
            <section class="cta-section section-alt">
                <h2 class="fade-up">${program.ctaText}</h2>
                <p class="fade-up" style="max-width: 480px; margin: 0 auto var(--space-3);">${program.ctaDescription}</p>
                <p class="fade-up" style="font-size: var(--text-xs); color: var(--text-tertiary); margin-bottom: var(--space-6);">${program.ctaSubtext}</p>
                <button class="btn btn-primary btn-lg fade-up" onclick="openDemandModal()">대기 등록하기</button>
                <p class="fade-up" style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--text-tertiary);">
                    궁금한 점이 있으신가요? <a href="career-consulting.html" style="color: var(--blue);">커리어 컨설팅만 따로 보기</a>
                </p>
            </section>
        `;
    }

    async function initProgramPage() {
        const mainContent = document.getElementById('programContent');
        const heroContainer = document.getElementById('programHero');
        if (!mainContent || !heroContainer) return;

        const urlParams = new URLSearchParams(window.location.search);
        const programId = urlParams.get('id');

        if (!programId) {
            window.location.href = 'index.html#services';
            return;
        }

        try {
            const data = await fetchPrograms();
            const program = data.programs.find(p => p.id === programId);

            if (!program) {
                mainContent.innerHTML = '<div class="section" style="text-align: center; padding: var(--space-16);"><h2>프로그램을 찾을 수 없습니다</h2><p><a href="index.html#services" style="color: var(--blue);">프로그램 목록으로 돌아가기</a></p></div>';
                return;
            }

            if (program.status !== 'active') {
                heroContainer.innerHTML = '';
                mainContent.innerHTML = `<div class="section" style="text-align: center; padding: var(--space-16);"><h2>${program.title}</h2><p style="margin-top: var(--space-4); color: var(--text-secondary); font-size: var(--text-lg);">현재 준비 중인 프로그램입니다.<br>오픈 시 안내를 받으시려면 상담을 신청해주세요.</p><div style="margin-top: var(--space-8); display: flex; gap: var(--space-4); justify-content: center;"><a href="index.html#services" class="btn btn-secondary">프로그램 목록</a><button class="btn btn-primary" onclick="openModal && openModal()">오픈 알림 신청</button></div></div>`;
                document.title = `${program.title} (준비 중) | SCM Labs`;
                return;
            }

            // Update page title and meta
            document.title = `${program.title} | SCM Labs`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = program.description;

            // Set hidden program_id in demand form
            const programIdInput = document.getElementById('demand-program-id');
            if (programIdInput) programIdInput.value = programId;

            // Render hero
            heroContainer.innerHTML = renderProgramHero(program);

            // Render main content sections
            let html = '';
            html += renderPainPoints(program);
            html += renderCurriculum(program);
            html += renderHowItWorks(program);
            html += renderTargetAudience(program);
            html += renderOutcomes(program);
            html += renderPricing(program);
            html += renderFaqs(program);
            html += renderCta(program);

            mainContent.innerHTML = html;

            // Re-observe fade-up elements
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            document.querySelectorAll('.fade-up:not(.visible)').forEach(el => observer.observe(el));

        } catch (error) {
            console.error('프로그램 로드 실패:', error);
            mainContent.innerHTML = '<div class="section" style="text-align: center;"><h2>로딩 중 오류가 발생했습니다</h2><p>잠시 후 다시 시도해주세요.</p></div>';
        }
    }

    // ===== Initialize =====
    window.ProgramsModule = {
        initIndexPage,
        initProgramPage,
        fetchPrograms
    };

    // Auto-initialize based on page
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('services')) {
            initIndexPage();
        }
        if (document.getElementById('programContent')) {
            initProgramPage();
        }
    });
})();
