(function () {
    function display(data) {
        const weekly_report_el = document.getElementById('weekly-report')
        function content_setter() {
            function sum_up(arr) {
                return arr.reduce((partial_sum, item) => partial_sum + item, 0)
            }
            function thousands2percentage(integer) {
                return Math.floor(integer / 10).toString() + '.' + (integer % 10).toString() + '%'
            }
            function minutes2text(minutes) {
                const hrs = Math.floor(minutes / 60)
                const mins = minutes - hrs * 60
                const temp = []
                if (hrs) { temp.push(hrs.toString() + (hrs === 1 ? ' hr' : ' hrs')) }
                if (mins) { temp.push(mins.toString() + (mins === 1 ? ' min' : ' mins')) }
                return temp.join(' ')
            }
            function pad_to_longest(arr) {
                const max_length = arr.reduce((partial_max, item) => Math.max(partial_max, item.length), 0)
                return arr.map(item => item.padStart(max_length, ' '))
            }
            function partition(arr, total) {
                const sum = sum_up(arr)
                let portions = arr.map(item => item * total / sum)
                portions.sort((a, b) => (b % 1) - (a % 1))
                portions = portions.map(item => Math.floor(item))
                const remaining = total - sum_up(portions)
                for (let i = 0; i !== remaining; ++i) {
                    ++portions[i]
                }
                portions.sort((a, b) => b - a)
                return portions
            }
            data.projects.sort((a, b) => b.duration - a.duration)
            const titles = data.projects.map(item => item.title)
            const durations = data.projects.map(item => item.duration)
            const total_duration = Math.round(sum_up(durations) / 60)
            const percentages = pad_to_longest(partition(durations, 1000).map(thousands2percentage))
            const minute_durations = pad_to_longest(partition(durations, total_duration).map(minutes2text))
            return function (progress_bar_length, right_aligned, simplified = false) {
                function span(content) {
                    return (right_aligned ? '<span class="qed">' : '<span>') + content + '</span>'
                }
                function progress_bar(numerator) {
                    return '█'.repeat(numerator) + '░'.repeat(progress_bar_length - numerator)
                }
                const numerators = partition(durations, progress_bar_length)
                const result = []
                if (simplified) {
                    for (let i = 0; i !== titles.length; ++i) {
                        result.push(titles[i] + span(minute_durations[i]))
                    }
                } else {
                    for (let i = 0; i !== titles.length; ++i) {
                        result.push(titles[i] + span(minute_durations[i] + ' ' +
                            progress_bar(numerators[i]) + ' ' + percentages[i]))
                    }
                }
                if (right_aligned) {
                    weekly_report_el.innerHTML = '<pre><code>' + data.begin + ' – ' + data.end + '\n' +
                        result.join('\n') + '</code></pre>'
                } else {
                    weekly_report_el.innerHTML = '<pre><code>' + '\n' +
                        result.join('\n') + '</code></pre>'
                }
            }
        }
        const setter = content_setter()
        function calc_gap() {
            const pre_el = weekly_report_el.firstChild
            const code_el = pre_el.firstChild
            return pre_el.offsetWidth - code_el.offsetWidth
        }
        function find_ideal_length() {
            function upper_bound(begin, end, pred) {
                function impl(l, r) {
                    if (l + 1 === r) { return l }
                    let m = (l + r) >> 1
                    return pred(m) ? impl(l, m) : impl(m, r)
                }
                return impl(begin, end)
            }
            function try_length(len) {
                setter(len, right_aligned = false)
                return calc_gap() < 50
            }
            return upper_bound(4, 17, try_length)
        }
        function render() {
            const ideal_length = find_ideal_length()
            if (ideal_length === 4) {
                setter(ideal_length, right_aligned = true, simplified = true)
            } else {
                setter(ideal_length, right_aligned = true)
            }
        }
        function on_change(evaluator, worker, interval) {
            worker()
            let last_value = evaluator()
            let locked = false
            function eval_check_work() {
                if (!locked) {
                    locked = true
                    if (evaluator() !== last_value) {
                        worker()
                        last_value = evaluator()
                    }
                    locked = false
                }
            }
            return setInterval(eval_check_work, interval)
        }
        on_change(calc_gap, render, 100)
    }
    function fetch_report_and_display() {
        fetch('https://server.duinomaker.top/report.json')
            .then(response => response.json())
            .then(data => { display(data) })
            .catch(error => {
                console.error(error)
                setTimeout(fetch_report_and_display, 3000)
            })
    }
    fetch_report_and_display()
})()