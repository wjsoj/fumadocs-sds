'use client'

import { useState, useEffect } from 'react'

export default function IaaaLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [error, setError] = useState('')
  const [showSmsCode, setShowSmsCode] = useState(false)
  const [showOtpCode] = useState(false)
  const [showValidCode] = useState(false)

  // 焦点管理
  useEffect(() => {
    // 设置页面标题
    document.title = '北京大学统一身份认证'
    
    // 页面加载后自动聚焦到用户名输入框
    const userNameInput = document.getElementById('user_name') as HTMLInputElement
    if (userNameInput) {
      userNameInput.focus()
    }
  }, [])

  // 验证学号格式的函数
  const validateStudentId = (studentId: string): boolean => {
    if (studentId.length !== 10) {
      return false
    }
    
    if (!/^\d{10}$/.test(studentId)) {
      return false
    }
    
    const year = studentId.substring(0, 2)
    const orgCode = studentId.substring(2, 4)
    
    const yearNum = parseInt(year)
    if (yearNum < 22 || yearNum > 25) {
      return false
    }
    
    const orgNum = parseInt(orgCode)
    if (orgNum > 17) {
      return false
    }
    
    return true
  }

  // 验证邮箱格式的函数
  const validateEmail = (email: string): boolean => {
    // 基本邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return false
    }
    
    // 检查是否以pku.edu.cn结尾（包括子域名）
    const domain = email.split('@')[1].toLowerCase()
    return domain === 'pku.edu.cn' || domain.endsWith('.pku.edu.cn')
  }

  // 验证手机号格式的函数
  const validatePhone = (phone: string): boolean => {
    // 中国大陆手机号验证：11位数字，以1开头，第二位是3-9
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent, nextField?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nextField) {
        const nextInput = document.getElementById(nextField) as HTMLInputElement
        if (nextInput) {
          nextInput.focus()
        }
      } else {
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.FormEvent<HTMLFormElement>
        handleSubmit(syntheticEvent)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }
    
    // 标记反钓鱼测试已完成
    localStorage.setItem('anti_phishing_test_completed', 'true')
    
    // 判断输入类型并进行相应验证
    let isValid = false
    let errorMessage = ''
    
    if (/^\d{10}$/.test(username)) {
      // 10位数字，按学号验证
      if (validateStudentId(username)) {
        isValid = true
      } else {
        errorMessage = '学号格式不正确（入校年：22-25，发证单位：01-17）'
      }
    } else if (username.includes('@')) {
      // 包含@符号，按邮箱验证
      if (validateEmail(username)) {
        isValid = true
      } else {
        errorMessage = '请使用北京大学邮箱（xxx@pku.edu.cn 或 xxx@stu.pku.edu.cn 等）'
      }
    } else if (/^\d+$/.test(username)) {
      // 纯数字但不是10位，按手机号验证
      if (validatePhone(username)) {
        isValid = true
      } else {
        errorMessage = '手机号格式不正确（请输入11位中国大陆手机号）'
      }
    } else {
      // 其他格式
      errorMessage = '请输入有效的学号、北大邮箱或手机号'
    }
    
    if (isValid) {
      // 验证通过，跳转到安全提醒页面
      window.location.href = 'https://iaaa.pkuits.com/static/warning-page-v2/'
    } else {
      setError(errorMessage)
    }
  }

  const handleInputChange = (field: 'username' | 'password', value: string) => {
    if (field === 'username') {
      setUsername(value)
      // 模拟原始页面的短信验证码显示逻辑
      setShowSmsCode(value.length > 0 && /^1[3-9]\d{9}$/.test(value))
    } else {
      setPassword(value)
    }
  }

  const resetInput = (field: 'username' | 'password') => {
    if (field === 'username') {
      setUsername('')
      setShowSmsCode(false)
    } else {
      setPassword('')
    }
  }

  const switchToQR = () => {
    setShowLogin(false)
  }

  const switchToLogin = () => {
    setShowLogin(true)
  }

  const clickCheck = () => {
    setRememberMe(!rememberMe)
  }

  return (
    <div className="ext-webkit ext-chrome ext-mac" style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
      <style jsx global>{`
        @import url('https://iaaa.pkuits.com/static/landing_page/src/login.css');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css');
        
        /* 强制保持白色背景，覆盖深色模式 */
        html, body {
          background-color: white !important;
          color: #333 !important;
          -webkit-text-size-adjust: 100% !important;
          margin: 0;
          padding: 0;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        
        /* 确保主要容器也是白色背景 */
        .main {
          background-color: white !important;
          min-height: 100vh;
        }
        
        /* 强制表单区域背景色 */
        .single_col_panel {
          background-color: rgba(255, 255, 255, 0.9) !important;
        }
        
        /* 确保输入框在深色模式下正常显示 */
        input[type="text"], input[type="password"], input[type="checkbox"], input[type="number"] {
          background-color: white !important;
          color: #333 !important;
          border: 1px solid #ccc !important;
        }
        
        /* 确保链接和文字颜色正确 */
        a, span, p, div {
          color: inherit !important;
        }
        
        /* 按钮样式保持 */
        .input-btn-row {
          background-color: #c41e3a !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px;
          cursor: pointer;
        }
        
        .input-btn-row:hover {
          background-color: #a01729 !important;
        }
        
        .input-btn-half-row {
          background-color: #c41e3a !important;
          color: white !important;
          border: none !important;
          padding: 8px 12px;
          cursor: pointer;
        }
        
        /* 清除按钮样式 */
        .i-clear {
          color: #999 !important;
          text-decoration: none;
          cursor: pointer;
        }
        
        .i-clear:hover {
          color: #333 !important;
        }
        
        /* 选项卡样式 */
        .row-title a {
          color: #666 !important;
          text-decoration: none;
        }
        
        .row-title a.current {
          color: #c41e3a !important;
          border-bottom: 2px solid #c41e3a;
        }
        
        /* 错误信息样式 */
        #msg {
          color: #c41e3a !important;
        }
        
        /* 复选框样式 */
          #remember_text {
            cursor: pointer;
            user-select: none;
          }
          
          /* 底部信息样式优化 */
          .bottom {
            padding: 20px;
          }
          
          /* 顶部logo样式 */
          .top {
            padding: 20px 0;
          }
          
          .top a {
            display: inline-block;
          }
          
          /* 移动端响应式样式 */
          @media (max-width: 768px) {
            .top {
              text-align: center;
              padding: 15px 0;
            }
            
            .top img {
              max-width: 200px;
              height: auto;
            }
            
            .lx_info {
              display: flex !important;
              flex-direction: column !important;
              gap: 8px;
              align-items: center;
            }
            
            .lx_info span {
              display: block !important;
              margin: 0 !important;
              text-align: center;
              font-size: 14px;
              line-height: 1.4;
            }
            
            .single_col_panel {
              margin: 10px;
              padding: 20px 15px;
            }
            
            .input-txt-row, .input-btn-row {
              font-size: 16px; /* 防止移动端缩放 */
            }
          }
          
          @media (max-width: 480px) {
            .top {
              padding: 10px 0;
            }
            
            .top img {
              max-width: 160px;
              height: auto;
            }
            
            .lx_info span {
              font-size: 12px;
            }
            
            .bottom {
              padding: 15px 10px;
            }
            
            .single_col_panel {
              margin: 5px;
              padding: 15px 10px;
            }
          }
          
          .ext-webkit.ext-chrome.ext-mac {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
      `}</style>
      
      <div className="main">
        <div className="top">
          <a href="http://www.pku.edu.cn/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://iaaa.pkuits.com/static/landing_page/src/pku_logo_red.png" alt="北京大学" />
          </a>
        </div>
        
        <div 
          className="mid" 
          style={{
            backgroundImage: `url("https://iaaa.pku.edu.cn/iaaa/resources/images/pku_view_8.jpg")`
          }}
        >
          <form id="submit_form" method="post" onSubmit={handleSubmit}>
            <div className="single_col_panel">
              <div className="row">
                <div className="row_50 center row-title">
                  <a 
                    onClick={switchToLogin} 
                    id="login_panel_top_bar" 
                    className={showLogin ? "current" : ""}
                    style={{ cursor: 'pointer' }}
                  >
                    账号登录
                  </a>
                </div>
                <div className="row_50 center row-title">
                  <a 
                    onClick={switchToQR} 
                    id="qrcode_panel_top_bar"
                    className={!showLogin ? "current" : ""}
                    style={{ cursor: 'pointer' }}
                  >
                    扫码登录
                  </a>
                </div>
              </div>
              
              {showLogin ? (
                <div id="login_panel">
                  <div className="row">
                    <input 
                      className="input-txt-row" 
                      type="text" 
                      tabIndex={1} 
                      id="user_name" 
                      value={username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'password')}
                      placeholder="学号/职工号/北大邮箱/手机号" 
                    />
                    {username && (
                      <a 
                        className="i-clear" 
                        onClick={() => resetInput('username')}
                        style={{ display: 'inline', cursor: 'pointer' }}
                      >
                        <i className="fa fa-times-circle"></i>
                      </a>
                    )}
                  </div>
                  
                  <div id="passwd_area" className="row">
                    <input 
                      className="input-txt-row input-txt-pad" 
                      type="password" 
                      tabIndex={2} 
                      id="password" 
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e)}
                      placeholder="密码" 
                    />
                    {password && (
                      <a 
                        className="i-clear i-clear-pad" 
                        onClick={() => resetInput('password')}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fa fa-times-circle"></i>
                      </a>
                    )}
                    <a 
                      href="https://iaaa.pku.edu.cn/iaaa/resources/help/findPwd.html" 
                      target="_blank" 
                      className="pad-tip"
                    >
                      忘记密码
                    </a>
                  </div>
                  
                  {/* 短信验证码区域 - 手机号时显示 */}
                  {showSmsCode && (
                    <div id="sms_area" className="row">
                      <input 
                        className="input-txt-half-row" 
                        type="number" 
                        pattern="[0-9]*" 
                        tabIndex={3} 
                        id="sms_code" 
                        placeholder="短信验证码" 
                      />
                      <a className="i-clear i-clear-half" style={{ cursor: 'pointer' }}>
                        <i className="fa fa-times-circle"></i>
                      </a>
                      <input 
                        className="input-btn-half-row" 
                        type="button" 
                        id="sms_button" 
                        value="获取短信验证码"
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  )}
                  
                  {/* 手机令牌区域 */}
                  {showOtpCode && (
                    <div id="otp_area" className="row">
                      <input 
                        className="input-txt-row input-txt-pad" 
                        type="number" 
                        pattern="[0-9]*" 
                        tabIndex={4} 
                        id="otp_code" 
                        placeholder="手机令牌" 
                      />
                      <a className="i-clear i-clear-pad" style={{ cursor: 'pointer' }}>
                        <i className="fa fa-times-circle"></i>
                      </a>
                      <a 
                        href="https://iaaa.pku.edu.cn/iaaa/resources/help/otpHelp.html" 
                        target="_blank" 
                        className="pad-tip"
                      >
                        使用说明
                      </a>
                    </div>
                  )}
                  
                  {/* 验证码区域 */}
                  {showValidCode && (
                    <div id="code_area" className="row">
                      <div className="row_66">
                        <input 
                          className="input-txt-row input-txt-pad2" 
                          type="text" 
                          tabIndex={5} 
                          id="valid_code" 
                          placeholder="验证码" 
                        />
                        <a className="i-clear i-clear-pad2" style={{ cursor: 'pointer' }}>
                          <i className="fa fa-times-circle"></i>
                        </a>
                        <a className="pad-tip" style={{ cursor: 'pointer' }}>换一张</a>
                      </div>
                      <div className="row_34">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img id="code_img" src="https://iaaa.pkuits.com/static/landing_page/src/DrawServlet" alt="验证码"/>
                      </div>
                    </div>
                  )}
                  
                  <div className="row-thin">
                    <input 
                      type="checkbox" 
                      id="remember_check" 
                      tabIndex={6}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div id="remember_text" onClick={clickCheck}>
                      <i className={`fa i-check ${rememberMe ? 'fa-check-square-o' : 'fa-square-o'}`}></i> 记住账号
                    </div>
                  </div>
                  
                  <div className="row-thin">
                    <span id="msg">{error}</span>
                  </div>
                  
                  <div className="row">
                    <input type="hidden" id="appid" value="portal2017" />
                    <input 
                      type="submit" 
                      className="input-btn-row" 
                      id="logon_button" 
                      value="登录" 
                      tabIndex={8}
                    />
                  </div>
                </div>
              ) : (
                <div id="qrcode_panel">
                  <div className="row" style={{ textAlign: 'center', marginTop: '0px', marginBottom: '0px' }}>
                    <p className="tip" style={{ textAlign: 'center', margin: '20px auto 10px auto' }} id="qrcode_tip">
                      使用<a href="https://its.pku.edu.cn/download_portalapp.jsp" target="_blank" className="tip">&quot;北京大学&quot;App</a>扫码进入
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      style={{ verticalAlign: 'top' }}
                      src="https://iaaa.pku.edu.cn/iaaa/oauth.jsp?appID=portal2017&appName=%E5%8C%97%E4%BA%AC%E5%A4%A7%E5%AD%A6%E6%A0%A1%E5%86%85%E4%BF%A1%E6%81%AF%E9%97%A8%E6%88%B7%E6%96%B0%E7%89%88&redirectUrl=https%3A%2F%2Fportal.pku.edu.cn%2Fportal2017%2FssoLogin.do" 
                      alt="二维码"
                    />
                  </div>
                  <div className="row" style={{ display: 'block' }}>
                    <p id="jumpBindCodeErrorMsg" style={{ textAlign: 'center', color: '#c41e3a' }}></p>
                    <p id="otpHelp2" style={{ textAlign: 'center', display: 'none' }}>
                      <a href="https://iaaa.pku.edu.cn/iaaa/resources/help/otpHelp.html" target="_blank">(绑定手机App使用说明)</a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="bottom">
          <div className="lx_info flex lg:flex-row flex-col">
            <span>服务热线：010-62751023</span>
            <span>Email：<a href="mailto:its@pku.edu.cn">its@pku.edu.cn</a></span>
            <span>© <a href="http://cc.pku.edu.cn/">北京大学计算中心</a></span>
          </div>
        </div>
      </div>
    </div>
  )
}